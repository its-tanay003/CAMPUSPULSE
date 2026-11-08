import { generateICS } from './icsExport';
import { CampusEvent } from '../types';

/**
 * Downloads a standard .ics file for a given event, or multiple events.
 */
export function exportEventToCalendar(event: CampusEvent): void {
  generateICS(event);
}

/**
 * Generates an aggregated multi-event ICS schedule for a student.
 */
export function exportScheduleToCalendar(events: CampusEvent[], scheduleName = 'CampusPulse_Schedule'): void {
  if (events.length === 0) return;

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const formatICSDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const eventEntries = events.map(e => `BEGIN:VEVENT
UID:${e.id}@campuspulse.edu
DTSTAMP:${now}
DTSTART:${formatICSDate(e.start_time)}
DTEND:${formatICSDate(e.end_time)}
SUMMARY:${e.title.replace(/[,;]/g, '')}
DESCRIPTION:${(e.description || '').replace(/(\r\n|\n|\r)/gm, ' ')}
LOCATION:${(e.venue?.name || 'On Campus').replace(/[,;]/g, '')}
STATUS:CONFIRMED
END:VEVENT`).join('\r\n');

  const fullICS = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusPulse//Student Schedule 2.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${scheduleName}`,
    eventEntries,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([fullICS], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scheduleName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
