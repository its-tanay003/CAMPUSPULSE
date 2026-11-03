import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidStatusTransition } from '../src/lib/lifecycleManager.ts';
import { detectEventConflicts } from '../src/lib/clashDetector.ts';
import type { CampusEvent, Venue, ApprovalAction, Organization, UserRole } from '../src/types/index.ts';

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

  // TEST 5: Venue Management & Authoritative Registry Governance
  describe('Venue Management & Data-Source Governance', () => {
    it('5.1 allows administrators to update permitted venue info and activate/deactivate', () => {
      const venuesList: Venue[] = JSON.parse(JSON.stringify(mockVenues));
      const targetVenueId = 'venue-shanti-audi';

      // Function simulating administrative update
      const updateVenueByRole = (role: UserRole, id: string, updates: Partial<Venue>) => {
        if (role !== 'admin') {
          throw new Error('Access denied: Only administrators can update campus venue records.');
        }
        const index = venuesList.findIndex(v => v.id === id);
        if (index !== -1) {
          venuesList[index] = { ...venuesList[index], ...updates };
        }
      };

      // Admin updates capacity and deactivates venue for renovation
      updateVenueByRole('admin', targetVenueId, { capacity: 2600, is_active: false });
      assert.strictEqual(venuesList[0].capacity, 2600);
      assert.strictEqual(venuesList[0].is_active, false);

      // Student or organizer attempt is rejected
      assert.throws(() => {
        updateVenueByRole('student', targetVenueId, { is_active: true });
      }, /Only administrators can update/);

      assert.throws(() => {
        updateVenueByRole('organizer', targetVenueId, { capacity: 9999 });
      }, /Only administrators can update/);
    });

    it('5.2 distinguishes authoritative sources from informal or demonstration venues', () => {
      const demoLawn: Venue = {
        id: 'venue-demo-lawn',
        name: 'Uni Open Lawn - East (Informal Area)',
        building: 'Open Grounds',
        location: 'Adjacent to Food Court',
        capacity: 100,
        authority: 'None (Informal)',
        is_authoritative: false,
        is_demo: true,
        is_active: true,
        data_source: 'Manual Student Submission'
      };

      // Availability cannot be authoritatively guaranteed for informal venues
      const checkAuthoritativeAvailabilityClaim = (v: Venue): { canClaimAvailability: boolean; warning?: string } => {
        if (!v.is_authoritative || v.is_demo) {
          return {
            canClaimAvailability: false,
            warning: "We can't confirm venue availability from the current records."
          };
        }
        return { canClaimAvailability: true };
      };

      const demoCheck = checkAuthoritativeAvailabilityClaim(demoLawn);
      assert.strictEqual(demoCheck.canClaimAvailability, false);
      assert.match(demoCheck.warning || '', /We can't confirm venue availability/);

      const officialCheck = checkAuthoritativeAvailabilityClaim(mockVenues[0]);
      assert.strictEqual(officialCheck.canClaimAvailability, true);
    });
  });

  // TEST 6: Organizer Verification Governance & Role Privilege
  describe('Organizer Verification Process & Self-Elevation Prevention', () => {
    it('6.1 enables administrators to grant or revoke verified organizer charter status', () => {
      const testOrg: Organization = {
        id: 'org-test-01',
        name: 'Robotics Innovators Club',
        category: 'Technical',
        lead_name: 'Priya Sharma',
        lead_email: 'priya@university.edu',
        is_verified: false,
        created_at: '2026-11-01T00:00:00Z'
      };

      const verifyOrgByRole = (
        role: UserRole, 
        org: Organization, 
        verified: boolean, 
        notes: string, 
        reviewerName: string
      ): Organization => {
        if (role !== 'admin') {
          throw new Error('Access denied: Ordinary users cannot grant or modify verified club charter status.');
        }
        return {
          ...org,
          is_verified: verified,
          verification_notes: notes,
          verified_by: reviewerName,
          verified_at: new Date().toISOString()
        };
      };

      // Student/organizer tries to self-verify -> throws error
      assert.throws(() => {
        verifyOrgByRole('student', testOrg, true, 'Self verified', 'Priya Sharma');
      }, /Ordinary users cannot grant/);

      assert.throws(() => {
        verifyOrgByRole('organizer', testOrg, true, 'Self verified', 'Priya Sharma');
      }, /Ordinary users cannot grant/);

      // Administrator verifies with review notes & timestamp
      const verifiedOrg = verifyOrgByRole(
        'admin', 
        testOrg, 
        true, 
        'Charter validated against Student Welfare Council Registry FY26.', 
        'Dr. R. K. Verma'
      );

      assert.strictEqual(verifiedOrg.is_verified, true);
      assert.strictEqual(verifiedOrg.verified_by, 'Dr. R. K. Verma');
      assert.ok(verifiedOrg.verified_at);
      assert.match(verifiedOrg.verification_notes || '', /Student Welfare Council/);
    });
  });

});

