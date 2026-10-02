import { DayFishingData, BestFishingWindow } from '../types';

/**
 * Format a Date and hour fraction/string to iCalendar UTC timestamp format (YYYYMMDDTHHmmssZ)
 */
function toICSDateTime(date: Date, hourStr: string): string {
  const [hStr, mStr] = hourStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;

  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());

  // Using local floating time format (YYYYMMDDTHHmm00) so it matches the user's local timezone directly
  return `${year}${month}${day}T${hours}${mins}${secs}`;
}

/**
 * Generates an .ics file string for a list of fishing windows across one or multiple days
 */
export function generateFishingICS(
  events: Array<{ day: DayFishingData; window: BestFishingWindow }>,
  calendarTitle = 'Calendario Pesca Orate Venezia'
): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Laguna Orate Venezia//Calendario Pesca Maree//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:Europe/Rome',
  ];

  events.forEach(({ day, window }, idx) => {
    const dtStart = toICSDateTime(day.date, window.startHour);
    const dtEnd = toICSDateTime(day.date, window.endHour);
    const uid = `orate-${day.dateString}-${window.startHour.replace(':', '')}-${idx}@laguna-orate.venezia`;

    const description = [
      `🎣 Laguna di Venezia - Orata (${day.ratingLabel})`,
      `⭐ Indice di Attività Finestra: ${window.score}% (Attività Giornaliera: ${day.overallScore}%)`,
      `🌊 Marea: ${window.tideContext}`,
      `🌙 Luna: ${day.moonPhaseLabel} (${day.moonIllumination}%)`,
      `💡 Tattica: ${window.reason}`,
      `🦐 Esche Consigliate: ${window.suggestedBait}`,
      `📍 Spot Raccomandati: ${window.suggestedSpots}`,
      `⚙️ Montatura: ${day.topRecommendedRig}`,
      `🌅 Alba: ${day.sunriseTime} | Tramonto: ${day.sunsetTime}`,
    ].join('\\n');

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${uid}`);
    icsLines.push(`DTSTAMP:${dtStamp}`);
    icsLines.push(`DTSTART:${dtStart}`);
    icsLines.push(`DTEND:${dtEnd}`);
    icsLines.push(`SUMMARY:🎣 Orata Laguna (${window.score}%): ${window.title}`);
    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push(`LOCATION:Laguna di Venezia - ${window.suggestedSpots}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('TRANSP:TRANSPARENT');

    // Reminder alarm 60 minutes before
    icsLines.push('BEGIN:VALARM');
    icsLines.push('TRIGGER:-PT60M');
    icsLines.push('ACTION:DISPLAY');
    icsLines.push(`DESCRIPTION:Preparazione pesca orata: ${window.title} (${window.startHour} - ${window.endHour})`);
    icsLines.push('END:VALARM');

    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  return icsLines.join('\r\n');
}

/**
 * Triggers a browser file download of the generated .ics calendar
 */
export function downloadICSFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
