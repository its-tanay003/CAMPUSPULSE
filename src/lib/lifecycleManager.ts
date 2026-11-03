import type { EventStatus, UserRole } from '../types/index.ts';

/**
 * Valid state transitions mapping:
 * Key: current status -> Array of valid target statuses
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['pending_review', 'cancelled'],
  pending_review: ['published', 'changes_requested', 'rejected', 'cancelled'],
  changes_requested: ['pending_review', 'draft', 'cancelled'],
  published: ['completed', 'cancelled'],
  rejected: ['draft', 'pending_review'],
  cancelled: ['draft'], // Only admin can reopen
  completed: [] // Terminal
};

/**
 * Role-based transition guard
 */
export function isValidStatusTransition(
  currentStatus: EventStatus,
  targetStatus: EventStatus,
  userRole: UserRole = 'student'
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // Administrative-only transitions (Anti-Self-Approval for published, changes_requested, rejected)
  if (['published', 'changes_requested', 'rejected'].includes(targetStatus) && userRole !== 'admin') {
    return {
      allowed: false,
      reason: `Permission denied: Only administrators can execute "${targetStatus}" review decisions.`
    };
  }

  const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTargets || !allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid lifecycle transition: Cannot transition event directly from "${currentStatus}" to "${targetStatus}".`
    };
  }

  // Terminal state protection
  if ((currentStatus === 'completed' || currentStatus === 'cancelled') && userRole !== 'admin') {
    return {
      allowed: false,
      reason: `Permission denied: "${currentStatus}" is a terminal state that can only be altered by an administrator.`
    };
  }

  return { allowed: true };
}

/**
 * Audit timeline step interface
 */
export interface StatusTimelineStep {
  status: EventStatus;
  title: string;
  description: string;
  timestamp?: string;
  actorName?: string;
  actorRole?: string;
  decisionNote?: string;
  isCurrent: boolean;
  isCompleted: boolean;
  actionRequired?: string;
}

/**
 * Derives the complete explainable status timeline for an event
 */
export function buildEventStatusTimeline(
  eventStatus: EventStatus,
  createdAt: string,
  updatedAt: string,
  approvalsHistory: Array<{
    decision: 'approved' | 'changes_requested' | 'rejected';
    reason: string;
    reviewer_name?: string;
    created_at: string;
  }> = []
): StatusTimelineStep[] {
  const latestApproval = approvalsHistory[0]; // most recent

  const steps: StatusTimelineStep[] = [];

  // Step 1: Draft Creation
  steps.push({
    status: 'draft',
    title: 'Event Drafted',
    description: 'Initial event proposal created and stored privately by club organizer.',
    timestamp: createdAt,
    isCurrent: eventStatus === 'draft',
    isCompleted: eventStatus !== 'draft',
    actionRequired: eventStatus === 'draft' ? 'Review all details and submit for administrative approval.' : undefined
  });

  // Step 2: Submission & Review
  const isSubmittedOrPast = ['pending_review', 'published', 'changes_requested', 'rejected', 'completed', 'cancelled'].includes(eventStatus);
  steps.push({
    status: 'pending_review',
    title: 'Submitted for Admin Review',
    description: 'Under review by the Dean of Student Welfare (DSW) & Estate Office for schedule collision verification.',
    timestamp: isSubmittedOrPast ? updatedAt : undefined,
    isCurrent: eventStatus === 'pending_review',
    isCompleted: ['published', 'changes_requested', 'rejected', 'completed'].includes(eventStatus),
    actionRequired: eventStatus === 'pending_review' ? 'Awaiting administrative verification and room allocation clearance.' : undefined
  });

  // Step 3: Decision / Outcome
  if (eventStatus === 'changes_requested') {
    steps.push({
      status: 'changes_requested',
      title: 'Changes Requested by Admin',
      description: 'The administrative review committee requested modifications before approval can be granted.',
      timestamp: latestApproval?.created_at || updatedAt,
      actorName: latestApproval?.reviewer_name || 'Admin Reviewer',
      decisionNote: latestApproval?.reason || 'Please revise the proposed event specifications or timing as directed.',
      isCurrent: true,
      isCompleted: false,
      actionRequired: 'Update the event details addressing the reviewer feedback and resubmit.'
    });
  } else if (eventStatus === 'rejected') {
    steps.push({
      status: 'rejected',
      title: 'Proposal Rejected',
      description: 'Event proposal could not be approved for campus scheduling.',
      timestamp: latestApproval?.created_at || updatedAt,
      actorName: latestApproval?.reviewer_name || 'Admin Reviewer',
      decisionNote: latestApproval?.reason || 'Proposal does not comply with campus scheduling policies.',
      isCurrent: true,
      isCompleted: false,
      actionRequired: 'Review the rejection rationale. Consult with student welfare administration if reapplication is desired.'
    });
  } else if (eventStatus === 'cancelled') {
    steps.push({
      status: 'cancelled',
      title: 'Event Cancelled',
      description: 'The event was cancelled by the host organization or campus administration.',
      timestamp: updatedAt,
      isCurrent: true,
      isCompleted: false,
      actionRequired: 'Event is delisted from the active discovery agenda.'
    });
  } else {
    // Standard successful track: Published -> Completed
    steps.push({
      status: 'published',
      title: 'Approved & Published',
      description: 'Event verified and live on public discovery feed, student agendas, and campus calendar.',
      timestamp: eventStatus === 'published' || eventStatus === 'completed' ? (latestApproval?.created_at || updatedAt) : undefined,
      actorName: latestApproval?.reviewer_name,
      decisionNote: latestApproval?.reason,
      isCurrent: eventStatus === 'published',
      isCompleted: eventStatus === 'completed',
      actionRequired: eventStatus === 'published' ? 'Promote event to attendees and prepare venue logistics.' : undefined
    });

    if (eventStatus === 'completed') {
      steps.push({
        status: 'completed',
        title: 'Event Completed',
        description: 'Event concluded successfully.',
        timestamp: updatedAt,
        isCurrent: true,
        isCompleted: true,
        actionRequired: 'Archive attendance records and collect student feedback.'
      });
    }
  }

  return steps;
}
