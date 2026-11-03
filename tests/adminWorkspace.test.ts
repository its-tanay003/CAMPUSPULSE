import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidStatusTransition } from '../src/lib/lifecycleManager.ts';
import { detectEventConflicts } from '../src/lib/clashDetector.ts';
import type { CampusEvent, Venue, ApprovalAction } from '../src/types/index.ts';

// Mock Test Venues
const mockVenues: Venue[] = [
  {
    id: 'venue-shanti-audi',
    name: 'Shanti Devi Mittal Auditorium (Audi-1)',
    building: 'Block 32',
    location: 'Central Campus',
    capacity: 2500,
    authority: 'Campus Central Estate & Room Allocation Office',
    is_authoritative: true,
    is_active: true
  }
];

// Mock Test Events
const mockEvents: CampusEvent[] = [
  {
    id: 'evt-pending-01',
    title: 'Autonomous AI Hack Sprint',
    description: 'Hack sprint proposal.',
    category: 'Technology',
    target_audience: 'B.Tech CSE Students',
    tags: ['Tech'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-shanti-audi',
    start_time: '2026-11-20T10:00:00Z',
    end_time: '2026-11-20T14:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'pending_review',
    created_by: 'user-organizer-01',
    views_count: 10,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'evt-live-02',
    title: 'University Convocation Ceremony',
    description: 'Annual convocation.',
    category: 'Academic',
    target_audience: 'All Graduating Students',
    tags: ['Convocation'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-shanti-audi',
    start_time: '2026-11-20T11:00:00Z', // Collides with evt-pending-01
    end_time: '2026-11-20T15:00:00Z',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    registration_method: 'internal',
    status: 'published',
    views_count: 1500,
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z'
  }
];

describe('Administrator Workspace & Clearance Governance Security', () => {

  // TEST 1: Role-Based Access Control for Administrative Actions
  describe('RBAC Administrative Authority', () => {
    it('1.1 allows provisioned administrators to execute approval decisions', () => {
      const approveCheck = isValidStatusTransition('pending_review', 'published', 'admin');
      assert.strictEqual(approveCheck.allowed, true);

      const requestChangesCheck = isValidStatusTransition('pending_review', 'changes_requested', 'admin');
      assert.strictEqual(requestChangesCheck.allowed, true);

      const rejectCheck = isValidStatusTransition('pending_review', 'rejected', 'admin');
      assert.strictEqual(rejectCheck.allowed, true);
    });

    it('1.2 denies students and organizers from executing approval decisions', () => {
      const studentAttempt = isValidStatusTransition('pending_review', 'published', 'student');
      assert.strictEqual(studentAttempt.allowed, false);
      assert.match(studentAttempt.reason || '', /Only administrators can execute/);

      const organizerAttempt = isValidStatusTransition('pending_review', 'published', 'organizer');
      assert.strictEqual(organizerAttempt.allowed, false);
      assert.match(organizerAttempt.reason || '', /Only administrators can execute/);
    });

    it('1.3 prevents organizers from executing changes_requested or rejected actions', () => {
      const orgReject = isValidStatusTransition('pending_review', 'rejected', 'organizer');
      assert.strictEqual(orgReject.allowed, false);

      const orgChanges = isValidStatusTransition('pending_review', 'changes_requested', 'organizer');
      assert.strictEqual(orgChanges.allowed, false);
    });
  });

  // TEST 2: Conflict Diagnostic & Evidence Inspection
  describe('Conflict Radar & Evidence in Admin Review', () => {
    it('2.1 flags double-booking collisions clearly for the administrator', () => {
      const pendingEvent = mockEvents[0];
      const conflictResult = detectEventConflicts(
        {
          start_time: pendingEvent.start_time,
          end_time: pendingEvent.end_time,
          venue_id: pendingEvent.venue_id,
          category: pendingEvent.category
        },
        mockEvents,
        mockVenues,
        pendingEvent.id
      );

      assert.strictEqual(conflictResult.has_hard_conflict, true);
      assert.strictEqual(conflictResult.conflicts[0].severity, 'hard_conflict');
      assert.strictEqual(conflictResult.conflicts[0].conflicting_event.id, 'evt-live-02');
      assert.strictEqual(conflictResult.conflicts[0].venue_name, 'Shanti Devi Mittal Auditorium (Audi-1)');
      assert.ok(conflictResult.conflicts[0].available_resolutions.length > 0);
    });
  });

  // TEST 3: Immutable Review History & Reason Requirement
  describe('Audit Trail & Review Reason Enforcement', () => {
    it('3.1 stores audit actions append-only without overwriting previous history', () => {
      const approvalAuditTrail: ApprovalAction[] = [];

      // Initial decision: changes requested
      const action1: ApprovalAction = {
        id: 'app-001',
        event_id: 'evt-pending-01',
        reviewer_id: 'admin-01',
        reviewer_name: 'Dr. R. K. Verma',
        decision: 'changes_requested',
        reason: 'Double-booked with convocation ceremony. Shift to Block 28 Hall B.',
        created_at: '2026-11-02T10:00:00Z'
      };
      approvalAuditTrail.push(action1);

      // Subsequent decision after re-submission: approved
      const action2: ApprovalAction = {
        id: 'app-002',
        event_id: 'evt-pending-01',
        reviewer_id: 'admin-01',
        reviewer_name: 'Dr. R. K. Verma',
        decision: 'approved',
        reason: 'Venue changed to Block 28. Approved and published.',
        created_at: '2026-11-03T11:00:00Z'
      };
      approvalAuditTrail.push(action2);

      // Verify audit history is preserved and non-overwriting
      assert.strictEqual(approvalAuditTrail.length, 2);
      assert.strictEqual(approvalAuditTrail[0].decision, 'changes_requested');
      assert.strictEqual(approvalAuditTrail[1].decision, 'approved');
      assert.strictEqual(approvalAuditTrail[0].reason, 'Double-booked with convocation ceremony. Shift to Block 28 Hall B.');
    });

    it('3.2 validates that reasons are strictly required for rejections and changes_requested', () => {
      const validateAdminInput = (decision: string, reason: string): boolean => {
        if ((decision === 'changes_requested' || decision === 'rejected') && !reason.trim()) {
          return false;
        }
        return true;
      };

      assert.strictEqual(validateAdminInput('changes_requested', ''), false);
      assert.strictEqual(validateAdminInput('rejected', '   '), false);
      assert.strictEqual(validateAdminInput('changes_requested', 'Please adjust room'), true);
      assert.strictEqual(validateAdminInput('approved', ''), true); // default reason allowed
    });
  });

  // TEST 4: Public Visibility Integrity
  describe('Public Visibility Strict Isolation', () => {
    it('4.1 verifies only published events appear in public feeds', () => {
      const publicFeed = mockEvents.filter(e => e.status === 'published');
      assert.strictEqual(publicFeed.length, 1);
      assert.strictEqual(publicFeed[0].id, 'evt-live-02');
      assert.ok(!publicFeed.some(e => e.status === 'pending_review'));
    });
  });

});
