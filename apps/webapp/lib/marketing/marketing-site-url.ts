import { getPrimaryRouteForCourseCode } from "@/lib/courseSlugMap";
import { courseDetailUrlWithClass } from "@/lib/marketing/checkout-url";

const MARKETING_SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://midwestea.vercel.app"
).replace(/\/$/, "");

export function absoluteMarketingUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${MARKETING_SITE_ORIGIN}${normalizedPath}`;
}

export function marketingPageUrlForCourse(
  courseCode: string | null | undefined,
  classId?: string | null
): string | null {
  if (!courseCode) return null;

  const route = getPrimaryRouteForCourseCode(courseCode);
  if (!route) return null;

  const path =
    classId != null && classId !== ""
      ? courseDetailUrlWithClass(route, classId, courseCode)
      : route;

  return absoluteMarketingUrl(path);
}
