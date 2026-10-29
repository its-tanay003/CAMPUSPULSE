import type { CampusEvent, ConflictItem, ConflictCheckResult, Venue } from '../types/index.ts';

/**
 * Proposed event interface for conflict analysis
 */
export interface ProposedEventInput {
  id?: string;
  title?: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  venue_id?: string;
  category?: string;
  target_audience?: string;
}

/**
 * Evaluates whether two half-open time intervals [start, end) overlap.
 * 
 * Formal Definition:
 * Interval A = [A.start, A.end)
 * Interval B = [B.start, B.end)
 * Overlap condition: (A.start < B.end) AND (B.start < A.end)
 * 
 * Half-open property:
 * If A ends exactly when B begins (e.g., A=[10:00, 11:00) and B=[11:00, 12:00)),
 * then A.start (10) < B.end (12) is TRUE, BUT B.start (11) < A.end (11) is FALSE.
 * Therefore, adjacent intervals do NOT overlap.
 */
export function areIntervalsOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;
  if (startA >= endA || startB >= endB) return false;
  return startA < endB && startB < endA;
}

/**
 * Explainable Conflict Detection Engine for CampusPulse.
 * 
 * Implements deterministic scheduling-conflict checks without opaque AI scores.
 * 
 * Classification Rules:
 * 1. Hard Conflict:
 *    - Trigger: Authoritative booking data confirms the same venue/resource is already reserved
 *      in an overlapping half-open interval.
 *    - Behavior: Blocks publication unless resolved by changing time or venue.
 * 
 * 2. Advisory Warning:
 *    - Trigger: Concurrent event targeting similar audience/category or competing for the same
 *      student time-slot without a direct venue clash.
 *    - Behavior: Advisory only — NEVER automatically blocks publication.
 * 
 * 3. Informational Notice:
 *    - Trigger: Related campus events occurring around the same time or same calendar date.
 *    - Behavior: Contextual awareness for organizers.
 * 
 * Verification fallback:
 * If venue is missing or non-authoritative:
 * "We can't confirm venue availability from the current records."
 */
export function detectEventConflicts(
  targetEvent: ProposedEventInput,
  existingEvents: CampusEvent[],
  venues: Venue[],
  excludeEventId?: string
): ConflictCheckResult {
  const conflicts: ConflictItem[] = [];
  const checkedAt = new Date().toISOString();

  // 1. Validate Input Dates
  if (!targetEvent.start_time || !targetEvent.end_time) {
    return {
      has_conflicts: false,
      has_hard_conflict: false,
      can_submit: true,
      conflicts: [],
      checked_at: checkedAt
    };
  }

  const targetStart = new Date(targetEvent.start_time).getTime();
  const targetEnd = new Date(targetEvent.end_time).getTime();

  if (isNaN(targetStart) || isNaN(targetEnd) || targetStart >= targetEnd) {
    return {
      has_conflicts: false,
      has_hard_conflict: false,
      can_submit: false,
      conflicts: [],
      checked_at: checkedAt
    };
  }

  // 2. Identify Venue & Authoritative Source
  const venueId = targetEvent.venue_id;
  const venueObj = venues.find(v => v.id === venueId);
  let unverifiedVenueWarning: string | undefined;

  if (!venueId || !venueObj) {
    unverifiedVenueWarning = "We can't confirm venue availability from the current records.";
  } else if (!venueObj.is_authoritative) {
    unverifiedVenueWarning = `Venue "${venueObj.name}" is marked as non-authoritative. We can't confirm venue availability from the current records.`;
  }

  // 3. Scan Existing Events
  for (const existing of existingEvents) {
    // Exclude the event currently being edited
    if (excludeEventId && existing.id === excludeEventId) continue;
    if (targetEvent.id && existing.id === targetEvent.id) continue;

    // Apply agreed rules: Cancelled and completed events do NOT reserve venue space
    if (['cancelled', 'completed', 'rejected'].includes(existing.status)) {
      continue;
    }

    const exStart = new Date(existing.start_time).getTime();
    const exEnd = new Date(existing.end_time).getTime();

    if (isNaN(exStart) || isNaN(exEnd)) continue;

    const hasTimeOverlap = areIntervalsOverlapping(targetStart, targetEnd, exStart, exEnd);

    const overlapStart = Math.max(targetStart, exStart);
    const overlapEnd = Math.min(targetEnd, exEnd);
    const overlapIntervalStr = hasTimeOverlap
      ? `${new Date(overlapStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${new Date(overlapEnd).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
      : undefined;

    const existingVenue = venues.find(v => v.id === existing.venue_id) || existing.venue;
    const isSameVenue = venueId && existing.venue_id && venueId === existing.venue_id;

    // ------------------------------------------------------------------------
    // RULE 1: HARD CONFLICT (Exact Venue Double-Booking on Authoritative Source)
    // ------------------------------------------------------------------------
    if (hasTimeOverlap && isSameVenue && venueObj?.is_authoritative) {
      conflicts.push({
        severity: 'hard_conflict',
        title: `Venue Double-Booking at ${venueObj.name}`,
        rule_triggered: 'Hard conflict: Same authoritative venue interval collision (existing.start_at < proposed.end_at AND proposed.start_at < existing.end_at)',
        rationale: `Authoritative booking records confirm "${venueObj.name}" is already reserved for "${existing.title}" by ${existing.organization?.name || 'another organizer'} during this exact window.`,
        conflicting_event: existing,
        venue_name: venueObj.name,
        date_string: new Date(existing.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        start_time: new Date(existing.start_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        end_time: new Date(existing.end_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        overlapping_interval: overlapIntervalStr,
        source_authority: venueObj.authority || 'Campus Central Estate & Room Allocation Office',
        is_authoritative: true,
        suggested_action: 'Shift event start/end hours or select an alternative authoritative campus venue.',
        available_resolutions: [
          'Change to an available venue (e.g. Block 28 Seminar Hall or UniPolis)',
          'Reschedule start time to avoid the overlap interval',
          'Contact the Estate Office for special joint-session authorization'
        ]
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // RULE 2: ADVISORY WARNING (Category / Demographic Collision without Venue Clash)
    // Audience overlap must NEVER automatically block publication.
    // ------------------------------------------------------------------------
    if (hasTimeOverlap && targetEvent.category && existing.category === targetEvent.category && !isSameVenue) {
      conflicts.push({
        severity: 'advisory_warning',
        title: `Audience & Category Competition (${targetEvent.category})`,
        rule_triggered: 'Advisory warning: Concurrent category overlap with potential student audience division',
        rationale: `"${existing.title}" is scheduled at ${existingVenue?.name || 'another venue'} during the same time window targeting the ${targetEvent.category} student cohort.`,
        conflicting_event: existing,
        venue_name: existingVenue?.name,
        date_string: new Date(existing.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        start_time: new Date(existing.start_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        end_time: new Date(existing.end_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        overlapping_interval: overlapIntervalStr,
        source_authority: 'CampusPulse Student Demographics Registry',
        is_authoritative: false,
        suggested_action: 'Advisory only: You may still submit. Consider adjusting your time slot to maximize attendance.',
        available_resolutions: [
          'Proceed with submission (audience overlap does not block approval)',
          'Adjust time by +2 hours to avoid peak competition',
          'Collaborate with the other club for a unified joint event'
        ]
      });
      continue;
    }

    // ------------------------------------------------------------------------
    // RULE 3: INFORMATIONAL NOTICE (Same Day Campus Calendar Context)
    // ------------------------------------------------------------------------
    const sameDay = new Date(targetStart).toDateString() === new Date(exStart).toDateString();
    if (sameDay && targetEvent.category === existing.category && !hasTimeOverlap) {
      conflicts.push({
        severity: 'informational_notice',
        title: `Same-Day ${targetEvent.category} Event Scheduled`,
        rule_triggered: 'Informational notice: Multiple category activities on same campus date',
        rationale: `Another ${targetEvent.category} event ("${existing.title}") is taking place earlier or later on this same day.`,
        conflicting_event: existing,
        venue_name: existingVenue?.name,
        date_string: new Date(existing.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
        start_time: new Date(existing.start_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        end_time: new Date(existing.end_time).toLocaleTimeString('en-IN', { timeStyle: 'short' }),
        source_authority: 'Campus Master Calendar',
        is_authoritative: false,
        suggested_action: 'Ensure campus promotion materials differentiate your program agenda.',
        available_resolutions: [
          'No scheduling action required',
          'Coordinate promotional timing across campus social channels'
        ]
      });
    }
  }

  const hasHardConflict = conflicts.some(c => c.severity === 'hard_conflict');

  return {
    has_conflicts: conflicts.length > 0,
    has_hard_conflict: hasHardConflict,
    can_submit: !hasHardConflict,
    unverified_venue_warning: unverifiedVenueWarning,
    conflicts,
    checked_at: checkedAt
  };
}

/**
 * Detects personal schedule collisions for student saved and registered events
 */
export function detectPersonalScheduleConflicts(
  userEvents: CampusEvent[]
): Array<{ eventA: CampusEvent; eventB: CampusEvent; overlapTime: string }> {
  const overlaps: Array<{ eventA: CampusEvent; eventB: CampusEvent; overlapTime: string }> = [];

  for (let i = 0; i < userEvents.length; i++) {
    for (let j = i + 1; j < userEvents.length; j++) {
      const a = userEvents[i];
      const b = userEvents[j];

      const aStart = new Date(a.start_time).getTime();
      const aEnd = new Date(a.end_time).getTime();
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();

      if (areIntervalsOverlapping(aStart, aEnd, bStart, bEnd)) {
        overlaps.push({
          eventA: a,
          eventB: b,
          overlapTime: `${new Date(Math.max(aStart, bStart)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(Math.min(aEnd, bEnd)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        });
      }
    }
  }

  return overlaps;
}
