/**
 * Parses a calendar date stored as `YYYY-MM-DD` into a local `Date`, without
 * letting the viewer's timezone shift the day. `new Date("2026-01-12")` parses
 * as UTC midnight, which rolls back to Jan 11 in any timezone behind UTC.
 */
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local calendar date as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

/** Subtract calendar days from a `YYYY-MM-DD` value. Empty if the source is not a date. */
export function subtractIsoDays(value: string, days: number): string {
  const date = parseCalendarDate(value);
  if (!date) return "";
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
}

export function calendarDaysUntil(isoDate: string): number | null {
  const start = parseCalendarDate(isoDate);
  if (!start) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((start.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function parseCalendarDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** Formats a calendar date stored as `YYYY-MM-DD` for display. */
export function formatCalendarDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseCalendarDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Month and day only, e.g. `Aug 18`. */
export function formatCalendarMonthDay(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseCalendarDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Formats a timestamp in the training center's local timezone, America/Chicago. */
export function formatChicagoTimestamp(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
