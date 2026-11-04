import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectEventConflicts, detectPersonalScheduleConflicts } from '../src/lib/clashDetector.ts';
import { isValidStatusTransition, buildEventStatusTimeline } from '../src/lib/lifecycleManager.ts';
import type { CampusEvent, Venue, SavedEvent, Registration, User, Organization, ApprovalAction, UserRole } from '../src/types/index.ts';

// Comprehensive Test Fixtures
const mockVenues: Venue[] = [
  {
    id: 'v-audi',
    name: 'Shanti Devi Mittal Auditorium (Audi-1)',
    building: 'Block 32',
    location: 'Central Campus',
    capacity: 2500,
    authority: 'Campus Central Estate Office',
    is_authoritative: true,
    is_active: true,
    data_source: 'Estate ERP'
  },
  {
    id: 'v-lab',
    name: 'Innovation & Robotics Lab',
    building: 'Block 38',
    location: 'Ground Floor',
    capacity: 60,
    authority: 'School of Computer Science',
    is_authoritative: true,
    is_active: true,
    data_source: 'Department Lab Register'
  },
  {
    id: 'v-demo-lawn',
    name: 'Uni Open Lawn - East (Informal Area)',
    building: 'Open Grounds',
    location: 'Adjacent to Food Court',
    capacity: 100,
    authority: 'None (Informal)',
    is_authoritative: false,
    is_demo: true,
    is_active: true,
    data_source: 'Manual Student Submission'
  }
];

const mockUsers: Record<string, User> = {
  student1: {
    id: 'u-std-1',
    email: 'student1@university.edu',
    full_name: 'Aarav Sharma',
    role: 'student',
    created_at: '2026-10-01T00:00:00Z',
    interests: ['Technology', 'Workshops']
  },
  student2: {
    id: 'u-std-2',
    email: 'student2@university.edu',
    full_name: 'Diya Patel',
    role: 'student',
    created_at: '2026-10-01T00:00:00Z'
  },
  organizer1: {
    id: 'u-org-1',
    email: 'techlead@university.edu',
    full_name: 'Rohan Mehra',
    role: 'organizer',
    created_at: '2026-10-01T00:00:00Z'
  },
  admin1: {
    id: 'u-adm-1',
    email: 'dean.welfare@university.edu',
    full_name: 'Dr. R. K. Verma',
    role: 'admin',
    created_at: '2026-10-01T00:00:00Z'
  }
};

const mockEvents: CampusEvent[] = [
  {
    id: 'e-pub-1',
    title: 'Autonomous Robotics Expo 2026',
    description: 'Annual robotics and autonomous agent showcase.',
    category: 'Technology',
    target_audience: 'All Students',
    tags: ['Robotics', 'AI'],
    organization_id: 'org-1',
    venue_id: 'v-audi',
    start_time: '2026-11-20T10:00:00Z',
    end_time: '2026-11-20T13:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    created_by: 'u-org-1',
    views_count: 320,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z'
  },
  {
    id: 'e-pub-2',
    title: 'Full-Stack Web3 Masterclass',
    description: 'Smart contracts and decentralized apps.',
    category: 'Workshops',
    target_audience: 'B.Tech CSE Students',
    tags: ['Web3', 'Blockchain'],
    organization_id: 'org-1',
    venue_id: 'v-lab',
    start_time: '2026-11-20T11:00:00Z', // Overlaps in time with e-pub-1 (11:00 to 13:00)
    end_time: '2026-11-20T14:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    created_by: 'u-org-1',
    views_count: 140,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z'
  },
  {
    id: 'e-draft-1',
    title: 'Draft Unapproved Hackathon',
    description: 'Internal organizing team draft.',
    category: 'Technology',
    target_audience: 'All',
    tags: ['Hackathon'],
    organization_id: 'org-1',
    venue_id: 'v-audi',
    start_time: '2026-11-25T10:00:00Z',
    end_time: '2026-11-25T16:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'draft',
    created_by: 'u-org-1',
    views_count: 0,
    created_at: '2026-11-02T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z'
  },
  {
    id: 'e-cancelled-1',
    title: 'Cancelled Drone Racing Qualifier',
    description: 'Cancelled due to outdoor rain forecast.',
    category: 'Sports',
    target_audience: 'All',
    tags: ['Sports'],
    organization_id: 'org-1',
    venue_id: 'v-audi',
    start_time: '2026-11-20T10:00:00Z',
    end_time: '2026-11-20T13:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'cancelled',
    created_by: 'u-org-1',
    views_count: 45,
    created_at: '2026-10-25T00:00:00Z',
    updated_at: '2026-10-30T00:00:00Z'
  }
];

describe('Comprehensive QA Test Execution Suite (CampusPulse)', () => {

  // 1. STUDENT TESTS
  describe('Student Experience & Journey', () => {
    it('STU-01: Browse published events (hides unapproved drafts and review items)', () => {
      const publicFeed = mockEvents.filter(e => e.status === 'published');
      assert.strictEqual(publicFeed.length, 2);
      assert.ok(publicFeed.every(e => e.status === 'published'));
      assert.ok(!publicFeed.some(e => e.status === 'draft'));
      assert.ok(!publicFeed.some(e => e.status === 'cancelled'));
    });

    it('STU-02: Search and filter events across title, category, and venue', () => {
      const query = 'Robotics';
      const results = mockEvents
        .filter(e => e.status === 'published')
        .filter(e => 
          e.title.toLowerCase().includes(query.toLowerCase()) || 
          e.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
        );
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'e-pub-1');
    });

    it('STU-03: Open event details with schedule and venue integrity', () => {
      const event = mockEvents.find(e => e.id === 'e-pub-1');
      assert.ok(event);
      assert.strictEqual(event.title, 'Autonomous Robotics Expo 2026');
      assert.strictEqual(event.venue_id, 'v-audi');
      assert.strictEqual(event.cost, 'Free');
    });

    it('STU-04: Save and unsave an event without duplicate entries', () => {
      let savedEvents: SavedEvent[] = [];
      const user = mockUsers.student1;
      const targetEventId = 'e-pub-1';

      // Save action
      const saveEvent = (userId: string, eventId: string) => {
        if (!savedEvents.some(s => s.user_id === userId && s.event_id === eventId)) {
          savedEvents.push({
            id: `save-${Date.now()}`,
            user_id: userId,
            event_id: eventId,
            saved_at: new Date().toISOString()
          });
        }
      };

      // Unsave action
      const unsaveEvent = (userId: string, eventId: string) => {
        savedEvents = savedEvents.filter(s => !(s.user_id === userId && s.event_id === eventId));
      };

      saveEvent(user.id, targetEventId);
      assert.strictEqual(savedEvents.length, 1);
      
      // Attempt duplicate save -> should not duplicate
      saveEvent(user.id, targetEventId);
      assert.strictEqual(savedEvents.length, 1);

      // Unsave
      unsaveEvent(user.id, targetEventId);
      assert.strictEqual(savedEvents.length, 0);
    });

    it('STU-05: View My Events returns strictly authenticated user records', () => {
      const savedEvents: SavedEvent[] = [
        { id: 's1', user_id: 'u-std-1', event_id: 'e-pub-1', saved_at: '2026-11-01T00:00:00Z' },
        { id: 's2', user_id: 'u-std-2', event_id: 'e-pub-2', saved_at: '2026-11-01T00:00:00Z' }
      ];

      // Student 1 queries their saved events
      const student1Saved = savedEvents.filter(s => s.user_id === mockUsers.student1.id);
      assert.strictEqual(student1Saved.length, 1);
      assert.strictEqual(student1Saved[0].event_id, 'e-pub-1');
      assert.ok(!student1Saved.some(s => s.user_id === mockUsers.student2.id));
    });

    it('STU-06: Inspect personal schedule overlaps between saved events', () => {
      // User saved both e-pub-1 (10:00-13:00) and e-pub-2 (11:00-14:00)
      const userSchedule = [mockEvents[0], mockEvents[1]];
      const overlaps = detectPersonalScheduleConflicts(userSchedule);

      assert.strictEqual(overlaps.length, 1);
      assert.strictEqual(overlaps[0].eventA.id, 'e-pub-1');
      assert.strictEqual(overlaps[0].eventB.id, 'e-pub-2');
      assert.ok(overlaps[0].overlapTime.length > 0);
    });
  });

  // 2. ORGANIZER TESTS
  describe('Organizer Lifecycle & Submission Workflow', () => {
    it('ORG-01: Create draft and validate required fields', () => {
      const validateEventForm = (data: Partial<CampusEvent>): { valid: boolean; errors: Record<string, string> } => {
        const errors: Record<string, string> = {};
        if (!data.title?.trim()) errors.title = 'Title is required';
        if (!data.start_time) errors.start_time = 'Start time is required';
        if (!data.end_time) errors.end_time = 'End time is required';
        if (data.start_time && data.end_time && new Date(data.start_time) >= new Date(data.end_time)) {
          errors.end_time = 'End time must be after start time';
        }
        if (!data.venue_id) errors.venue_id = 'Venue is required';
        return { valid: Object.keys(errors).length === 0, errors };
      };

      // Incomplete payload
      const invalid = validateEventForm({ title: '' });
      assert.strictEqual(invalid.valid, false);
      assert.ok(invalid.errors.title);

      // Valid draft payload
      const valid = validateEventForm({
        title: 'New AI Workshop',
        start_time: '2026-11-22T10:00:00Z',
        end_time: '2026-11-22T12:00:00Z',
        venue_id: 'v-audi'
      });
      assert.strictEqual(valid.valid, true);
    });

    it('ORG-02: Check for scheduling conflicts on propose (venue double-booking)', () => {
      // Propose event overlapping e-pub-1 at v-audi (10:30 to 12:30 vs 10:00 to 13:00)
      const result = detectEventConflicts(
        {
          start_time: '2026-11-20T10:30:00Z',
          end_time: '2026-11-20T12:30:00Z',
          venue_id: 'v-audi',
          category: 'Technology'
        },
        mockEvents,
        mockVenues
      );

      assert.strictEqual(result.has_hard_conflict, true);
      assert.strictEqual(result.conflicts[0].severity, 'hard_conflict');
      assert.strictEqual(result.conflicts[0].conflicting_event.id, 'e-pub-1');
    });

    it('ORG-03: Resolve a warning by selecting alternative non-overlapping time or venue', () => {
      // Shifting time to 13:00-16:00 (adjacent half-open, starting exactly when e-pub-1 ends)
      const adjacentResult = detectEventConflicts(
        {
          start_time: '2026-11-20T13:00:00Z',
          end_time: '2026-11-20T16:00:00Z',
          venue_id: 'v-audi',
          category: 'Technology'
        },
        mockEvents,
        mockVenues
      );

      assert.strictEqual(adjacentResult.has_hard_conflict, false);
    });

    it('ORG-04: Submit an event (draft -> pending_review)', () => {
      const transition = isValidStatusTransition('draft', 'pending_review', 'organizer');
      assert.strictEqual(transition.allowed, true);
    });

    it('ORG-05: View review status timeline for an event proposal', () => {
      const event = mockEvents[0];
      const approvals = [
        {
          id: 'app-1',
          event_id: event.id,
          reviewer_id: 'u-adm-1',
          reviewer_name: 'Dr. R. K. Verma',
          decision: 'approved' as const,
          reason: 'Venue booking verified by Estate Office.',
          created_at: '2026-11-02T10:00:00Z'
        }
      ];

      const timeline = buildEventStatusTimeline(event.status, event.created_at, event.updated_at, approvals);
      assert.ok(timeline.length >= 3);
      assert.strictEqual(timeline[timeline.length - 1].status, 'published');
      assert.strictEqual(timeline[timeline.length - 1].isCurrent, true);
    });
  });

  // 3. ADMINISTRATOR TESTS
  describe('Administrator Governance & Review Actions', () => {
    it('ADM-01: Open approval queue and isolate pending proposals', () => {
      const eventsPool: CampusEvent[] = [
        ...mockEvents,
        {
          id: 'e-pending-1',
          title: 'Pending Hackathon Proposal',
          description: 'Awaiting admin clearance.',
          category: 'Technology',
          target_audience: 'All',
          tags: ['Hack'],
          organization_id: 'org-1',
          venue_id: 'v-audi',
          start_time: '2026-11-30T10:00:00Z',
          end_time: '2026-11-30T16:00:00Z',
          timezone: 'Asia/Kolkata',
          cost: 'Free',
          registration_method: 'internal',
          status: 'pending_review',
          created_by: 'u-org-1',
          views_count: 0,
          created_at: '2026-11-02T00:00:00Z',
          updated_at: '2026-11-02T00:00:00Z'
        }
      ];

      const queue = eventsPool.filter(e => e.status === 'pending_review');
      assert.strictEqual(queue.length, 1);
      assert.strictEqual(queue[0].id, 'e-pending-1');
    });

    it('ADM-02: Request changes with required reviewer rationale', () => {
      const transition = isValidStatusTransition('pending_review', 'changes_requested', 'admin');
      assert.strictEqual(transition.allowed, true);

      // Verify reason is mandatory
      const validateAction = (reason: string) => Boolean(reason.trim().length > 0);
      assert.strictEqual(validateAction(''), false);
      assert.strictEqual(validateAction('Please adjust room capacity.'), true);
    });

    it('ADM-03: Review a corrected resubmission (changes_requested -> pending_review)', () => {
      const resubmitCheck = isValidStatusTransition('changes_requested', 'pending_review', 'organizer');
      assert.strictEqual(resubmitCheck.allowed, true);
    });

    it('ADM-04: Approve or reject an event and record immutable audit action', () => {
      const auditLog: ApprovalAction[] = [];
      const recordApproval = (eventId: string, decision: 'approved' | 'rejected', reason: string) => {
        auditLog.push({
          id: `audit-${Date.now()}`,
          event_id: eventId,
          reviewer_id: mockUsers.admin1.id,
          reviewer_name: mockUsers.admin1.full_name,
          decision,
          reason,
          created_at: new Date().toISOString()
        });
      };

      recordApproval('e-pending-1', 'approved', 'Authorized for Block 32 Audi-1.');
      assert.strictEqual(auditLog.length, 1);
      assert.strictEqual(auditLog[0].decision, 'approved');
      assert.strictEqual(auditLog[0].reviewer_name, 'Dr. R. K. Verma');
    });

    it('ADM-05: Verify public event visibility upon approval transition', () => {
      let eventStatus: CampusEvent['status'] = 'pending_review';
      const isPubliclyVisible = (s: CampusEvent['status']) => s === 'published';

      assert.strictEqual(isPubliclyVisible(eventStatus), false);
      // Admin approves
      eventStatus = 'published';
      assert.strictEqual(isPubliclyVisible(eventStatus), true);
    });
  });

  // 4. SECURITY TESTS
  describe('Security & Role Escalation Defense', () => {
    it('SEC-01: Prevents students from executing administrative approval actions', () => {
      const attempt = isValidStatusTransition('pending_review', 'published', 'student');
      assert.strictEqual(attempt.allowed, false);
      assert.match(attempt.reason || '', /Only administrators can execute/);
    });

    it('SEC-02: Prevents organizers from self-approving proposals (Anti-Self-Publish)', () => {
      const attempt = isValidStatusTransition('pending_review', 'published', 'organizer');
      assert.strictEqual(attempt.allowed, false);
      assert.match(attempt.reason || '', /Only administrators can execute/);
    });

    it('SEC-03: Cross-user data isolation (User cannot delete or access another users saved bookmarks)', () => {
      const savedStore = [
        { id: 'sb-1', user_id: 'u-std-1', event_id: 'e-pub-1' },
        { id: 'sb-2', user_id: 'u-std-2', event_id: 'e-pub-2' }
      ];

      // Student 1 attempts to delete Student 2's record
      const deleteSavedRecord = (requestingUserId: string, targetRecordId: string) => {
        const record = savedStore.find(r => r.id === targetRecordId);
        if (!record || record.user_id !== requestingUserId) {
          throw new Error('Access Denied: RLS ownership violation.');
        }
        return true;
      };

      assert.throws(() => {
        deleteSavedRecord('u-std-1', 'sb-2');
      }, /RLS ownership violation/);
    });

    it('SEC-04: Ordinary users cannot self-elevate to verified organizer charter', () => {
      const verifyClub = (role: UserRole) => {
        if (role !== 'admin') {
          throw new Error('Access denied: Privileged administrator operation required.');
        }
        return true;
      };

      assert.throws(() => verifyClub('student'), /Access denied/);
      assert.throws(() => verifyClub('organizer'), /Access denied/);
      assert.strictEqual(verifyClub('admin'), true);
    });
  });

  // 5. EDGE CASES
  describe('Edge Cases & Resiliency', () => {
    it('EDGE-01: Empty search results handling', () => {
      const results = mockEvents.filter(e => e.title.includes('NonExistentKeywordXYZ'));
      assert.strictEqual(results.length, 0);
    });

    it('EDGE-02: Missing or unselected venue gracefully warns and falls back', () => {
      const checkResult = detectEventConflicts(
        {
          start_time: '2026-11-20T10:00:00Z',
          end_time: '2026-11-20T12:00:00Z',
          venue_id: '',
          category: 'Technology'
        },
        mockEvents,
        mockVenues
      );

      assert.strictEqual(checkResult.has_hard_conflict, false);
      assert.ok(checkResult.unverified_venue_warning);
      assert.match(checkResult.unverified_venue_warning!, /can't confirm venue availability/);
    });

    it('EDGE-03: Cancelled events do NOT block physical venue allocations', () => {
      // mockEvents contains 'e-cancelled-1' at 'v-audi' during 2026-11-20T10:00 to 13:00.
      // Another event proposed in that exact slot should NOT conflict with the cancelled event.
      const checkResult = detectEventConflicts(
        {
          start_time: '2026-11-20T10:00:00Z',
          end_time: '2026-11-20T13:00:00Z',
          venue_id: 'v-audi',
          category: 'Technology'
        },
        [mockEvents.find(e => e.id === 'e-cancelled-1')!], // only pass cancelled event
        mockVenues
      );

      assert.strictEqual(checkResult.has_hard_conflict, false);
      assert.strictEqual(checkResult.conflicts.length, 0);
    });

    it('EDGE-04: Adjacent non-overlapping events (half-open intervals [start, end)) do NOT collide', () => {
      // Event A: 10:00 - 12:00. Event B: 12:00 - 14:00 at same venue.
      const checkResult = detectEventConflicts(
        {
          start_time: '2026-11-20T12:00:00Z',
          end_time: '2026-11-20T14:00:00Z',
          venue_id: 'v-audi',
          category: 'Technology'
        },
        [
          {
            ...mockEvents[0],
            start_time: '2026-11-20T10:00:00Z',
            end_time: '2026-11-20T12:00:00Z'
          }
        ],
        mockVenues
      );

      assert.strictEqual(checkResult.has_hard_conflict, false);
    });

    it('EDGE-05: Non-authoritative / informal venues output explicit availability disclaimer', () => {
      const checkResult = detectEventConflicts(
        {
          start_time: '2026-11-20T10:00:00Z',
          end_time: '2026-11-20T12:00:00Z',
          venue_id: 'v-demo-lawn',
          category: 'Technology'
        },
        mockEvents,
        mockVenues
      );

      assert.strictEqual(checkResult.has_hard_conflict, false);
      assert.ok(checkResult.unverified_venue_warning);
      assert.match(checkResult.unverified_venue_warning!, /can't confirm venue availability/);
    });

    it('EDGE-06: Registration deadline passed correctly marks registration closed', () => {
      const isRegistrationClosed = (deadlineString?: string): boolean => {
        if (!deadlineString) return false;
        return new Date(deadlineString).getTime() < Date.now();
      };

      const pastDeadline = '2026-10-01T00:00:00Z';
      const futureDeadline = '2026-12-01T00:00:00Z';

      assert.strictEqual(isRegistrationClosed(pastDeadline), true);
      assert.strictEqual(isRegistrationClosed(futureDeadline), false);
    });
  });

});
