const ECUADOR_OFFSET = '-05:00';

function ecuadorDateParts(date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

function localDateToInstant(year: number, month: number, day: number): Date {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00${ECUADOR_OFFSET}`);
}

export function ecuadorTodayBounds(): { start: Date; end: Date } {
  const p = ecuadorDateParts();
  const start = localDateToInstant(p.year, p.month, p.day);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function ecuadorWeekBounds(): { start: Date; end: Date } {
  const today = ecuadorTodayBounds().start;
  const day = today.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  const start = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function ecuadorOrderTimestamp(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => formatted.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}${part('month')}${part('day')}${part('hour')}${part('minute')}${part('second')}`;
}
