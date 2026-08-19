export type CompletionCertificateProps = {
  studentName: string;
  /** Course label in the body sentence, e.g. "EMT-B". */
  courseName: string;
  /** ISO date (`YYYY-MM-DD`) or a parseable date string. */
  completionDate: string;
  /** Years of validity. Used to compute expiry; not drawn on the PDF. */
  durationYears?: number | null;
  bemsNumber?: string;
  programDirectorName?: string;
  presidentName?: string;
  /** Origin for `/images/certificates/*` assets, e.g. `window.location.origin`. */
  assetBaseUrl?: string;
};

export const DEFAULT_CERTIFICATE_STATICS = {
  bemsNumber: "04722B-CA",
  programDirectorName: "Kyle Brower",
  presidentName: "Gabe Hajmohammad",
} as const;

export function parseLocalDate(value: string): Date {
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoDay) {
    return new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]));
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid completion date: ${value}`);
  }
  return parsed;
}

function ordinalSuffix(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return "ST";
  if (j === 2 && k !== 12) return "ND";
  if (j === 3 && k !== 13) return "RD";
  return "TH";
}

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

/** Example: `APRIL 11TH, 2026`. */
export function formatCertificateDate(value: string): string {
  const date = parseLocalDate(value);
  const day = date.getDate();
  return `${MONTHS[date.getMonth()]} ${day}${ordinalSuffix(day)}, ${date.getFullYear()}`;
}

/** Calendar date `durationYears` after completion, as `YYYY-MM-DD`, or null if duration is unset. */
export function getCertificateExpiresAt(
  completionDate: string,
  durationYears?: number | null,
): string | null {
  if (durationYears == null || Number.isNaN(durationYears)) return null;
  const date = parseLocalDate(completionDate);
  date.setFullYear(date.getFullYear() + durationYears);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatExpiresLabel(isoDay: string): string {
  const date = parseLocalDate(isoDay);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
