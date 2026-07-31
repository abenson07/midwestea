export interface RecommendationCourse {
  code: string;
  name: string;
}

/**
 * Hard-coded course list for the internal "which courses would you recommend
 * next" quiz. Mirrors `courseLinks` in lib/marketing/nav-data.ts (the site's
 * actual Courses nav, which excludes Programs like EMT/Paramedic/etc).
 * BLS is first intentionally; the rest can be in any order.
 */
export const RECOMMENDATION_COURSES: RecommendationCourse[] = [
  { code: "BLS", name: "Basic Life Support" },
  { code: "ACLS", name: "Advanced Cardiovascular Life Support" },
  { code: "CPR", name: "CPR / First Aid" },
  { code: "CABS", name: "Child & Babysitting Safety" },
  { code: "AVERT", name: "Active Violence Emergency Response" },
  { code: "PEDS", name: "Pediatric CPR" },
  { code: "OXY", name: "Emergency Oxygen" },
  { code: "PALS", name: "Pediatric Advanced Life Support" },
  { code: "PATH", name: "Bloodborne Pathogens" },
  { code: "EPI", name: "Epinephrine" },
];

export const RECOMMENDATION_COURSE_CODES = new Set(
  RECOMMENDATION_COURSES.map((c) => c.code)
);

export const MIN_RECOMMENDATIONS = 3;
export const MAX_RECOMMENDATIONS = 5;

export type RecommendationAnswers = Record<string, string[]>;

/**
 * Validate a full set of answers server-side: every course must be answered
 * with 3-5 valid, non-self recommendations.
 */
export function validateRecommendationAnswers(
  answers: unknown
): answers is RecommendationAnswers {
  if (!answers || typeof answers !== "object") return false;

  for (const course of RECOMMENDATION_COURSES) {
    const picks = (answers as Record<string, unknown>)[course.code];

    if (!Array.isArray(picks)) return false;
    if (picks.length < MIN_RECOMMENDATIONS || picks.length > MAX_RECOMMENDATIONS) {
      return false;
    }
    if (new Set(picks).size !== picks.length) return false;

    for (const pick of picks) {
      if (typeof pick !== "string") return false;
      if (pick === course.code) return false;
      if (!RECOMMENDATION_COURSE_CODES.has(pick)) return false;
    }
  }

  return true;
}
