import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  isValidStatusTransition, 
  ALLOWED_STATUS_TRANSITIONS, 
  buildEventStatusTimeline 
} from '../src/lib/lifecycleManager.ts';
import { detectEventConflicts } from '../src/lib/clashDetector.ts';
import type { CampusEvent, Venue, EventStatus } from '../src/types/index.ts';

// Mock Venues
const mockVenues: Venue[] = [
  {
    id: 'venue-main-audi',
    name: 'Main Campus Auditorium',
    building: 'Block 32',
    location: 'Central Campus',
    capacity: 2500,
    authority: 'Campus Central Estate & Room Allocation Office',
    is_authoritative: true,
    is_active: true
  }
];

// Mock Existing Database Events
const mockExistingEvents: CampusEvent[] = [
  {
    id: 'evt-live-101',
    title: 'Autonomous Robotics Symposium',
    description: 'Published robotics event.',
    category: 'Technology',
    target_audience: 'Engineers',
    tags: ['Robotics'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-main-audi',
    start_time: '2026-11-15T10:00:00Z',
    end_time: '2026-11-15T13:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    views_count: 120,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'evt-draft-102',
    title: 'Secret Internal Club Meeting',
    description: 'Internal private planning session.',
    category: 'Technology',
    target_audience: 'Core Club Members',
    tags: ['Private'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-main-audi',
    start_time: '2026-11-16T14:00:00Z',
    end_time: '2026-11-16T16:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'none',
    status: 'draft',
    created_by: 'user-organizer-01',
    views_count: 5,
    created_at: '2026-11-02T10:00:00Z',
    updated_at: '2026-11-02T10:00:00Z'
  },
  {
    id: 'evt-pending-103',
    title: 'Acoustic Guitar Showcase',
    description: 'Acoustic open mic under admin review.',
    category: 'Music',
    target_audience: 'All Students',
    tags: ['Music'],
    organization_id: 'org-cultural-society',
    venue_id: 'venue-main-audi',
    start_time: '2026-11-17T18:00:00Z',
    end_time: '2026-11-17T21:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'pending_review',
    created_by: 'user-organizer-02',
    views_count: 12,
    created_at: '2026-11-03T10:00:00Z',
    updated_at: '2026-11-03T10:00:00Z'
  }
];

describe('CampusPulse Event Submission Workflow & Lifecycle Transitions', () => {

  // TEST 1: Lifecycle Transition Rules & Anti-Self-Approval
  describe('Status Transitions & Authorization Rules', () => {
    it('1.1 allows valid standard progression: draft -> pending_review', () => {
      const res = isValidStatusTransition('draft', 'pending_review', 'organizer');
      assert.strictEqual(res.allowed, true);
    });

    it('1.2 prevents organizers from directly publishing an event (Anti-Self-Approval)', () => {
      const res = isValidStatusTransition('draft', 'published', 'organizer');
      assert.strictEqual(res.allowed, false);
      assert.match(res.reason || '', /Only administrators can execute/);
    });

    it('1.3 allows administrators to approve pending_review -> published', () => {
      const res = isValidStatusTransition('pending_review', 'published', 'admin');
      assert.strictEqual(res.allowed, true);
    });

    it('1.4 allows administrators to request changes or reject proposals', () => {
      const resChanges = isValidStatusTransition('pending_review', 'changes_requested', 'admin');
      assert.strictEqual(resChanges.allowed, true);

      const resReject = isValidStatusTransition('pending_review', 'rejected', 'admin');
      assert.strictEqual(resReject.allowed, true);
    });

    it('1.5 prevents illegal skipped transitions (e.g. draft -> completed)', () => {
      const res = isValidStatusTransition('draft', 'completed', 'admin');
      assert.strictEqual(res.allowed, false);
      assert.match(res.reason || '', /Cannot transition event directly/);
    });

    it('1.6 treats completed and cancelled as terminal unless restored by admin', () => {
      const resOrganizer = isValidStatusTransition('completed', 'draft', 'organizer');
      assert.strictEqual(resOrganizer.allowed, false);

      const resAdmin = isValidStatusTransition('cancelled', 'draft', 'admin');
      assert.strictEqual(resAdmin.allowed, true);
    });
  });

  // TEST 2: Conflict Rechecking upon Submission
  describe('Submission Conflict Re-Check', () => {
    it('2.1 blocks submission to pending_review if a newly approved event double-books the venue', () => {
      // Proposed submission collides with evt-live-101 (10:00 - 13:00 at venue-main-audi)
      const proposedSubmission = {
        title: 'Conflicting Tech Talk',
        venue_id: 'venue-main-audi',
        start_time: '2026-11-15T11:00:00Z',
        end_time: '2026-11-15T14:00:00Z',
        category: 'Technology'
      };

      const check = detectEventConflicts(proposedSubmission, mockExistingEvents, mockVenues);
      assert.strictEqual(check.has_hard_conflict, true);
      assert.strictEqual(check.can_submit, false);
      assert.strictEqual(check.conflicts[0].severity, 'hard_conflict');
      assert.strictEqual(check.conflicts[0].conflicting_event.id, 'evt-live-101');
    });

    it('2.2 permits submission if venue time window is clear or adjacent', () => {
      const clearSubmission = {
        title: 'Afternoon Clear Talk',
        venue_id: 'venue-main-audi',
        start_time: '2026-11-15T13:00:00Z', // Starts exactly when evt-live-101 ends (Half-open [start, end))
        end_time: '2026-11-15T16:00:00Z',
        category: 'Technology'
      };

      const check = detectEventConflicts(clearSubmission, mockExistingEvents, mockVenues);
      assert.strictEqual(check.has_hard_conflict, false);
      assert.strictEqual(check.can_submit, true);
    });
  });

  // TEST 3: Public Visibility Enforcement
  describe('Public Visibility Database-Grade Rules', () => {
    it('3.1 public discover/feed filters out drafts, pending_review, changes_requested, and rejected events', () => {
      const isPublicVisible = (e: CampusEvent) => ['published', 'completed', 'cancelled'].includes(e.status);

      const publicVisibleEvents = mockExistingEvents.filter(isPublicVisible);

      assert.strictEqual(publicVisibleEvents.length, 1);
      assert.strictEqual(publicVisibleEvents[0].id, 'evt-live-101');
      assert.ok(!publicVisibleEvents.some(e => e.id === 'evt-draft-102'), 'Draft must be invisible to public');
      assert.ok(!publicVisibleEvents.some(e => e.id === 'evt-pending-103'), 'Pending review must be invisible to public');
    });

    it('3.2 unauthorized visitor direct detail navigation is blocked for unapproved events', () => {
      const canViewEventDetail = (e: CampusEvent, userRole: string = 'visitor', isOrgMember: boolean = false) => {
        if (['published', 'completed', 'cancelled'].includes(e.status)) return true;
        if (userRole === 'admin') return true;
        if (userRole === 'organizer' && isOrgMember) return true;
        return false;
      };

      const draftEvent = mockExistingEvents.find(e => e.id === 'evt-draft-102')!;

      // Visitor attempting to view draft
      assert.strictEqual(canViewEventDetail(draftEvent, 'visitor', false), false);

      // Random student attempting to view draft
      assert.strictEqual(canViewEventDetail(draftEvent, 'student', false), false);

      // Organizer belonging to another club
      assert.strictEqual(canViewEventDetail(draftEvent, 'organizer', false), false);

      // Authorized organizer of that specific club
      assert.strictEqual(canViewEventDetail(draftEvent, 'organizer', true), true);

      // Administrator
      assert.strictEqual(canViewEventDetail(draftEvent, 'admin', false), true);
    });
  });

  // TEST 4: Status Timeline Construction & Explanations
  describe('Status Timeline Builder', () => {
    it('4.1 constructs explainable timeline steps with reviewer notes when changes requested', () => {
      const timeline = buildEventStatusTimeline(
        'changes_requested',
        '2026-11-01T10:00:00Z',
        '2026-11-03T14:00:00Z',
        [
          {
            decision: 'changes_requested',
            reason: 'Audio equipment reservation must be confirmed with Block 32 estate office.',
            reviewer_name: 'Dr. R. K. Verma (Admin)',
            created_at: '2026-11-03T14:00:00Z'
          }
        ]
      );

      const currentStep = timeline.find(s => s.isCurrent);
      assert.ok(currentStep, 'Must have a current step');
      assert.strictEqual(currentStep.status, 'changes_requested');
      assert.strictEqual(currentStep.actorName, 'Dr. R. K. Verma (Admin)');
      assert.strictEqual(currentStep.decisionNote, 'Audio equipment reservation must be confirmed with Block 32 estate office.');
      assert.ok(currentStep.actionRequired?.includes('Update the event details'));
    });
  });

});

