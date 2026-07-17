export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Resta días calendario a una fecha YYYY-MM-DD (sin depender de duración UTC del día). */
export function subtractCalendarDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateInTimezone(timezone: string, from: Date = new Date()): string {
  const today = formatDateInTimezone(from, timezone);
  return subtractCalendarDays(today, 1);
}

const WEEKDAY_OFFSET_FROM_MONDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Lunes de la semana ISO en el calendario del timezone (YYYY-MM-DD). */
export function getIsoWeekStartDateInTimezone(
  timezone: string,
  from: Date = new Date()
): string {
  const today = formatDateInTimezone(from, timezone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(from);
  const offset = WEEKDAY_OFFSET_FROM_MONDAY[weekday] ?? 0;
  return subtractCalendarDays(today, offset);
}
