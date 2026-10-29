import { CampusEvent, ConflictItem, Venue } from '../types';

/**
 * Formula specified in Section 07 of P17 Blueprint:
 * Hard conflict: Same authoritative venue/resource; time intervals overlap:
 * Overlap condition: A.start < B.end AND B.start < A.end
 * 
 * Strong warning: Same date/time window and likely shared target audience (e.g. Technology)
 * Heads-up: Multiple events on same campus evening
 */
export function detectEventConflicts(
  targetEvent: Partial<CampusEvent> & { start_time: string; end_time: string; venue_id: string },
  existingEvents: CampusEvent[],
  venues: Venue[],
  excludeEventId?: string
): ConflictItem[] {
  const conflicts: ConflictItem[] = [];
  if (!targetEvent.start_time || !targetEvent.end_time || !targetEvent.venue_id) {
    return conflicts;
  }

  const targetStart = new Date(targetEvent.start_time).getTime();
  const targetEnd = new Date(targetEvent.end_time).getTime();

  if (isNaN(targetStart) || isNaN(targetEnd) || targetStart >= targetEnd) {
    return conflicts;
  }

  const venueObj = venues.find(v => v.id === targetEvent.venue_id);

  for (const ev of existingEvents) {
    if (excludeEventId && ev.id === excludeEventId) continue;
    // only compare against published or pending events (skip rejected/cancelled)
    if (['rejected', 'cancelled'].includes(ev.status)) continue;

    const evStart = new Date(ev.start_time).getTime();
    const evEnd = new Date(ev.end_time).getTime();

    // Overlap: A.start < B.end AND B.start < A.end
    const hasTimeOverlap = targetStart < evEnd && evStart < targetEnd;

    // Rule 1: Same venue + Time overlap (Hard Conflict)
    if (hasTimeOverlap && ev.venue_id === targetEvent.venue_id) {
      conflicts.push({
        severity: 'hard_conflict',
        title: `Venue Double-Booking at ${venueObj?.name || 'Selected Venue'}`,
        rule_triggered: 'Hard conflict: Same authoritative venue interval collision (A.start < B.end && B.start < A.end)',
        rationale: `The venue "${venueObj?.name || targetEvent.venue_id}" is already scheduled for "${ev.title}" during this time window.`,
        conflicting_event: ev,
        venue_name: venueObj?.name,
        overlapping_interval: `${new Date(Math.max(targetStart, evStart)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(Math.min(targetEnd, evEnd)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        suggested_action: 'Shift time slot or allocate an alternative available venue (e.g. Block 28 Seminar Hall or UniPolis).'
      });
      continue;
    }

    // Rule 2: Shared Category / Audience collision in same window (Strong Warning)
    if (hasTimeOverlap && targetEvent.category && ev.category === targetEvent.category) {
      conflicts.push({
        severity: 'strong_warning',
        title: `Audience & Category Overlap (${targetEvent.category})`,
        rule_triggered: 'Strong warning: Same date/time window with overlapping target demographic',
        rationale: `Both events target the "${targetEvent.category}" student cohort at the same time ("${ev.title}"). This may split attendance.`,
        conflicting_event: ev,
        overlapping_interval: `${new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        suggested_action: 'Coordinate with the organizing club or offset your starting hour to maximize campus reach.'
      });
      continue;
    }

    // Rule 3: Heads up if same day & evening peak
    const sameDay = new Date(targetStart).toDateString() === new Date(evStart).toDateString();
    if (sameDay && targetEvent.category === ev.category && !hasTimeOverlap) {
      conflicts.push({
        severity: 'heads_up',
        title: `Same Day ${targetEvent.category} Activity`,
        rule_triggered: 'Heads-up notice: Multiple departmental activities on same calendar day',
        rationale: `Event "${ev.title}" occurs earlier or later on this same day.`,
        conflicting_event: ev,
        suggested_action: 'Review the day agenda to prevent student fatigue.'
      });
    }
  }

  return conflicts;
}

/**
 * Checks for personal student calendar schedule conflicts
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

      if (aStart < bEnd && bStart < aEnd) {
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

