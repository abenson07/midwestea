/** 30 calendar days after expiration → archive in Webflow (per MWO-239). */
export const RETENTION_MS_AFTER_EXPIRY = 30 * 24 * 60 * 60 * 1000;

export const DEFAULT_URGENT_MS = 14 * 24 * 60 * 60 * 1000;

export function parseIsoMs(iso: string | null | undefined): number | null {
  if (!iso || typeof iso !== "string") return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** True when `now` is past expiration + 30 days (archive threshold). */
export function isPastRetentionArchive(
  expiresAtIso: string | null | undefined,
  nowMs: number
): boolean {
  const exp = parseIsoMs(expiresAtIso);
  if (exp === null) return false;
  return nowMs > exp + RETENTION_MS_AFTER_EXPIRY;
}

/** CMS "Expires at" is required; use when the dashboard sends no date (empty field). */
export function defaultExpiresAtIso(nowMs: number): string {
  return new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export function defaultUrgentUntilIso(
  expiresAtIso: string,
  nowMs: number
): string {
  const exp = parseIsoMs(expiresAtIso);
  if (exp === null) {
    return new Date(nowMs + DEFAULT_URGENT_MS).toISOString();
  }
  const candidate = nowMs + DEFAULT_URGENT_MS;
  return new Date(Math.min(candidate, exp)).toISOString();
}

export type UrgentExpireValidation =
  | { ok: true }
  | { ok: false; error: string };

export function validateUrgentWindow(
  urgent: boolean,
  urgentUntilIso: string | null | undefined,
  expiresAtIso: string | null | undefined
): UrgentExpireValidation {
  if (!urgent) return { ok: true };
  if (!expiresAtIso) {
    return {
      ok: false,
      error: "An expiration date is required when urgent mode is on.",
    };
  }
  const exp = parseIsoMs(expiresAtIso);
  const u = parseIsoMs(urgentUntilIso ?? null);
  if (exp === null) {
    return { ok: false, error: "Expiration date is invalid." };
  }
  if (u === null) {
    return { ok: false, error: "Urgent-until date is invalid." };
  }
  if (u > exp) {
    return {
      ok: false,
      error: "Urgent-until must be on or before the banner expiration.",
    };
  }
  return { ok: true };
}

export type BannerTimeframe = "current" | "upcoming" | "past";

/** Classify a banner for dashboard tabs (current = live, upcoming = inactive, past = expired/archived). */
export function classifyBannerTimeframe(
  banner: {
    active: boolean;
    isArchived: boolean;
    derived: { isExpired: boolean; hiddenByRetention?: boolean };
  },
): BannerTimeframe {
  if (
    banner.isArchived ||
    banner.derived.isExpired ||
    banner.derived.hiddenByRetention === true
  ) {
    return "past";
  }
  return banner.active ? "current" : "upcoming";
}

export function slugifyBase(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "") || "banner";
}
