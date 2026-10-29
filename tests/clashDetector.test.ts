import { describe, it } from 'node:test';
import assert from 'node:assert';
import { areIntervalsOverlapping, detectEventConflicts } from '../src/lib/clashDetector.ts';
import type { ProposedEventInput } from '../src/lib/clashDetector.ts';
import type { CampusEvent, Venue } from '../src/types/index.ts';

// Mock Authoritative & Non-Authoritative Venues
const mockVenues: Venue[] = [
  {
    id: 'venue-audi-1',
    name: 'Shanti Devi Mittal Auditorium (Audi-1)',
    building: 'Block 32',
    location: 'Central Campus',
    capacity: 2500,
    authority: 'Campus Central Estate & Room Allocation Office',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-audi-2',
    name: 'Block 34 Mini Auditorium',
    building: 'Block 34',
    location: 'School of Computer Science',
    capacity: 350,
    authority: 'CSE Department Administration',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-unofficial-lawn',
    name: 'Student Center Lawns (Informal Open Ground)',
    building: 'Student Center',
    location: 'Open Ground',
    capacity: 100,
    authority: 'Informal/Unregistered',
    is_authoritative: false, // Non-authoritative demonstration source
    is_active: true
  }
];

// Base Seeded Existing Events
const mockExistingEvents: CampusEvent[] = [
  {
    id: 'evt-001',
    title: 'Agentic AI Workshop',
    description: 'Workshop on autonomous agents.',
    category: 'Technology',
    target_audience: 'B.Tech CSE Students',
    tags: ['AI', 'Tech'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-audi-1',
    start_time: '2026-11-05T14:00:00Z',
    end_time: '2026-11-05T17:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    views_count: 100,
    created_at: '2026-10-25T10:00:00Z',
    updated_at: '2026-10-25T10:00:00Z'
  },
  {
    id: 'evt-002-cancelled',
    title: 'Old Cancelled Seminar',
    description: 'Cancelled seminar.',
    category: 'Technology',
    target_audience: 'All Students',
    tags: ['Seminar'],
    organization_id: 'org-acm',
    venue_id: 'venue-audi-1',
    start_time: '2026-11-05T14:00:00Z',
    end_time: '2026-11-05T17:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'none',
    status: 'cancelled',
    views_count: 10,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z'
  },
  {
    id: 'evt-003-other-venue',
    title: 'Competitive Coding Sprint',
    description: 'ACM coding contest.',
    category: 'Technology', // Same category!
    target_audience: 'Coders',
    tags: ['Coding'],
    organization_id: 'org-acm',
    venue_id: 'venue-audi-2', // Different venue!
    start_time: '2026-11-05T14:30:00Z',
    end_time: '2026-11-05T16:30:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    views_count: 50,
    created_at: '2026-10-26T10:00:00Z',
    updated_at: '2026-10-26T10:00:00Z'
  }
];

describe('Explainable Conflict-Checking Service (CampusPulse)', () => {

  // TEST 1: Same venue and overlapping intervals
  it('TEST 1: Identifies hard conflict when same authoritative venue has overlapping intervals', () => {
    const proposed: ProposedEventInput = {
      title: 'Robotics Showcase',
      venue_id: 'venue-audi-1', // Same as evt-001
      start_time: '2026-11-05T15:00:00Z', // Overlaps 14:00 - 17:00
      end_time: '2026-11-05T18:00:00Z',
      category: 'Technology'
    };

    const result = detectEventConflicts(proposed, mockExistingEvents, mockVenues);
    assert.strictEqual(result.has_hard_conflict, true);
    assert.strictEqual(result.can_submit, false);

    const hardClash = result.conflicts.find(c => c.severity === 'hard_conflict');
    assert.ok(hardClash, 'Must generate a hard conflict');
    assert.strictEqual(hardClash.venue_name, 'Shanti Devi Mittal Auditorium (Audi-1)');
    assert.strictEqual(hardClash.is_authoritative, true);
    assert.strictEqual(hardClash.conflicting_event.id, 'evt-001');
    assert.ok(hardClash.available_resolutions.length > 0, 'Must provide available resolutions');
  });

  // TEST 2: Same venue but adjacent intervals (Half-open [start, end))
  it('TEST 2: Treats intervals as half-open — adjacent intervals do not overlap', () => {
    // Proposed ends exactly when evt-001 starts: 12:00 to 14:00
    const proposedBefore: ProposedEventInput = {
      title: 'Morning Briefing',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-05T12:00:00Z',
      end_time: '2026-11-05T14:00:00Z', // Exactly matches evt-001 start
      category: 'Academic'
    };

    const resBefore = detectEventConflicts(proposedBefore, mockExistingEvents, mockVenues);
    assert.strictEqual(resBefore.has_hard_conflict, false, 'Adjacent interval before should not collide');

    // Proposed starts exactly when evt-001 ends: 17:00 to 19:00
    const proposedAfter: ProposedEventInput = {
      title: 'Evening Cultural Night',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-05T17:00:00Z', // Exactly matches evt-001 end
      end_time: '2026-11-05T19:00:00Z',
      category: 'Cultural'
    };

    const resAfter = detectEventConflicts(proposedAfter, mockExistingEvents, mockVenues);
    assert.strictEqual(resAfter.has_hard_conflict, false, 'Adjacent interval after should not collide');
    assert.strictEqual(resAfter.can_submit, true);
  });

  // TEST 3: Different venues at the same time
  it('TEST 3: Different venues at the same time generate advisory warning, NOT hard conflict', () => {
    const proposed: ProposedEventInput = {
      title: 'DevFest Hack Sprint',
      venue_id: 'venue-audi-1', // Venue 1
      start_time: '2026-11-05T14:30:00Z',
      end_time: '2026-11-05T16:00:00Z',
      category: 'Technology' // Same category as evt-003 at Venue 2
    };

    // Remove evt-001 so there is no venue clash, only evt-003 at venue-audi-2
    const otherVenueOnly = mockExistingEvents.filter(e => e.id === 'evt-003-other-venue');

    const result = detectEventConflicts(proposed, otherVenueOnly, mockVenues);
    assert.strictEqual(result.has_hard_conflict, false, 'No venue clash means no hard conflict');
    assert.strictEqual(result.can_submit, true, 'Audience overlap must never automatically block publication');

    const advisory = result.conflicts.find(c => c.severity === 'advisory_warning');
    assert.ok(advisory, 'Must produce an advisory warning for same category in same time slot');
    assert.strictEqual(advisory.conflicting_event.id, 'evt-003-other-venue');
  });

  // TEST 4: Cancelled events
  it('TEST 4: Ignores cancelled and completed events when checking venue availability', () => {
    // Only test against evt-002-cancelled
    const cancelledOnly = mockExistingEvents.filter(e => e.status === 'cancelled');

    const proposed: ProposedEventInput = {
      title: 'Fresh Proposal in Cancelled Slot',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-05T14:00:00Z',
      end_time: '2026-11-05T17:00:00Z',
      category: 'Technology'
    };

    const result = detectEventConflicts(proposed, cancelledOnly, mockVenues);
    assert.strictEqual(result.has_hard_conflict, false);
    assert.strictEqual(result.conflicts.length, 0, 'Cancelled event must release venue reservation');
  });

  // TEST 5: Editing an existing event (Exclude self)
  it('TEST 5: Excludes self when an organizer edits an existing event record', () => {
    // Organizer is updating evt-001's description or time window slightly
    const proposedSelf: ProposedEventInput = {
      id: 'evt-001',
      title: 'Agentic AI Workshop (Updated)',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-05T14:00:00Z',
      end_time: '2026-11-05T17:00:00Z',
      category: 'Technology'
    };

    // Exclude evt-001
    const result = detectEventConflicts(proposedSelf, mockExistingEvents, mockVenues, 'evt-001');
    assert.strictEqual(result.has_hard_conflict, false, 'Editing own event must not conflict with itself');
  });

  // TEST 6: Missing venue information
  it('TEST 6: Displays standard fallback when venue information is missing or unselected', () => {
    const proposedNoVenue: ProposedEventInput = {
      title: 'Venue Unassigned Talk',
      venue_id: '',
      start_time: '2026-11-05T14:00:00Z',
      end_time: '2026-11-05T17:00:00Z',
      category: 'Academic'
    };

    const result = detectEventConflicts(proposedNoVenue, mockExistingEvents, mockVenues);
    assert.strictEqual(
      result.unverified_venue_warning,
      "We can't confirm venue availability from the current records."
    );
  });

  // TEST 7: Non-authoritative demonstration data
  it('TEST 7: Warns when venue source is non-authoritative', () => {
    const proposedNonAuthVenue: ProposedEventInput = {
      title: 'Informal Acoustic Jam',
      venue_id: 'venue-unofficial-lawn', // Marked is_authoritative = false
      start_time: '2026-11-05T16:00:00Z',
      end_time: '2026-11-05T18:00:00Z',
      category: 'Music'
    };

    const result = detectEventConflicts(proposedNonAuthVenue, mockExistingEvents, mockVenues);
    assert.ok(
      result.unverified_venue_warning?.includes("We can't confirm venue availability from the current records."),
      'Non-authoritative venue must display standard availability disclaimer'
    );
  });

  // TEST 8: A new conflict appearing between draft creation and submission
  it('TEST 8: Re-running check on submission catches a newly approved concurrent booking', () => {
    const proposedDraft: ProposedEventInput = {
      title: 'Annual Drone Championship',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-10T10:00:00Z',
      end_time: '2026-11-10T13:00:00Z',
      category: 'Technology'
    };

    // Step A: At initial draft time, venue is totally free on Nov 10
    const initialEventsList = [...mockExistingEvents];
    const initialCheck = detectEventConflicts(proposedDraft, initialEventsList, mockVenues);
    assert.strictEqual(initialCheck.has_hard_conflict, false, 'Clear at draft creation');

    // Step B: Another club gets an event approved for that same room on Nov 10 in the interim
    const interimApprovedEvent: CampusEvent = {
      id: 'evt-interim-new-booking',
      title: 'Dean Student Welcome Convocation',
      description: 'Convocation ceremony.',
      category: 'Academic',
      target_audience: 'Freshers',
      tags: ['Convocation'],
      organization_id: 'org-google-dev',
      venue_id: 'venue-audi-1',
      start_time: '2026-11-10T11:00:00Z', // Collides with 10:00 - 13:00!
      end_time: '2026-11-10T14:00:00Z',
      timezone: 'Asia/Kolkata',
      cost: 'Free',
      registration_method: 'internal',
      status: 'published',
      views_count: 5,
      created_at: '2026-10-29T20:00:00Z',
      updated_at: '2026-10-29T20:00:00Z'
    };

    const updatedEventsList = [...mockExistingEvents, interimApprovedEvent];

    // Step C: Repeat the check when the organizer clicks "Submit for Admin Approval"
    const finalSubmissionCheck = detectEventConflicts(proposedDraft, updatedEventsList, mockVenues);
    assert.strictEqual(finalSubmissionCheck.has_hard_conflict, true, 'Interim booking caught at submission time');
    assert.strictEqual(finalSubmissionCheck.can_submit, false);
    assert.strictEqual(finalSubmissionCheck.conflicts[0].conflicting_event.id, 'evt-interim-new-booking');
  });

});
