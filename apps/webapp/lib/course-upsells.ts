import type { UpsellCourse } from "../emails/components/CourseUpsellGrid";

/**
 * Ordered "what to take next" list per completed course code. Provided by
 * the program director (BEN-1155) — not derived from any table.
 */
export const COURSE_UPSELL_MAP: Record<string, string[]> = {
  BLS: ["ACLS", "PEDS", "PALS", "AVERT", "CABS"],
  ACLS: ["PALS", "AVERT", "CABS"],
  CPR: ["BLS", "CABS", "AVERT", "EPI", "OXY"],
  CABS: ["BLS", "PEDS", "CPR", "EPI", "AVERT"],
  AVERT: ["CPR", "OXY", "BLS"],
  PEDS: ["BLS", "CPR", "EPI", "CABS", "OXY"],
  OXY: ["BLS", "CPR", "EPI", "CABS", "PATH"],
  PALS: ["ACLS", "BLS", "CPR", "AVERT", "PEDS"],
  PATH: ["BLS", "CPR", "OXY", "EPI", "PEDS"],
  EPI: ["BLS", "CPR", "AVERT", "OXY", "PATH"],
};

export type UpsellCourseLookup = Map<string, { name: string }>;

/**
 * Implements the selection algorithm documented (but left unbuilt) in
 * emails/completed-class-followups.tsx: candidates for the completed course,
 * minus whatever the student already holds, capped at `max`.
 */
export function getSuggestedFollowUps(
  completedCourseCode: string | null | undefined,
  studentHeldCourseCodes: string[],
  courseLookup: UpsellCourseLookup,
  siteUrl: string,
  max = 4,
): UpsellCourse[] {
  if (!completedCourseCode) return [];
  const candidates = COURSE_UPSELL_MAP[completedCourseCode.toUpperCase()] ?? [];
  const held = new Set(studentHeldCourseCodes.map((code) => code.toUpperCase()));
  const relevant = candidates.filter((code) => !held.has(code.toUpperCase()));

  return relevant.slice(0, max).map((code) => ({
    title: courseLookup.get(code)?.name ?? code,
    description: "Recertification and next-step training for first responders.",
    href: `${siteUrl}/courses`,
  }));
}
