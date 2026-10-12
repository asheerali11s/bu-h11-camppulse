import { CampusEvent } from '@/types';

/**
 * Formats a Date object or ISO string into an iCalendar compliant UTC timestamp string (YYYYMMDDTHHmmssZ)
 */
function formatDateToICS(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escapes characters for ICS content
 */
function escapeICS(str: string): string {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an .ics file content string and triggers an instant browser file download.
 * Compatible with Apple Calendar, Google Calendar, Outlook, and mobile calendar apps.
 */
export function downloadEventICS(event: CampusEvent): void {
  if (typeof window === 'undefined') return;

  const dtStart = formatDateToICS(event.start_time);
  const dtEnd = formatDateToICS(event.end_time);
  const now = formatDateToICS(new Date().toISOString());
  const uid = `event-${event.id}-${Date.now()}@camppulse.campus`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampPulse//Campus Event Calendar Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(
      `${event.description}\n\nOrganized by: ${event.society?.name || 'Campus Society'}\nCategory: ${event.category}`
    )}`,
    `LOCATION:${escapeICS(event.location_name)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeICS(event.title)} is starting in 30 minutes!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanFilename || 'event'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a direct Google Calendar Web Link for convenient one-click cloud adding
 */
export function getGoogleCalendarLink(event: CampusEvent): string {
  const start = formatDateToICS(event.start_time);
  const end = formatDateToICS(event.end_time);
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nHost: ${event.society?.name || 'CampPulse'}`
  );
  const location = encodeURIComponent(event.location_name);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
