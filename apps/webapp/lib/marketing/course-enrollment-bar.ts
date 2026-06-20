import type { EnrollmentBarProps } from "@/components/marketing/enrollment-bar";
import type { CourseHeaderContent } from "@/components/marketing/product-header-6";

/** Fallback prices from the courses gallery when registerPrice is not set in page content. */
const courseEnrollmentTitlesByRoute: Record<string, string[]> = {
  "/active-shooter-training": ["Active Violence", "Emergency Response"],
  "/emergency-use-of-medical-oxygen": ["Emergency Use", "of Medical Oxygen"],
  "/use-and-administration-of-epinephrine-auto-injectors": ["Epinephrine"],
};

const coursePricesByRoute: Record<string, string> = {
  "/basic-life-support": "49.99",
  "/advanced-cardiovascular-life-support": "149.99",
  "/active-shooter-training": "39.99",
  "/pediatric-first-aid-cpr-aed": "34.99",
  "/pediatric-advanced-life-support": "34.99",
  "/child-and-babysitting-safety": "34.99",
  "/cpr-first-aid": "34.99",
  "/bloodborne-pathogens": "19.99",
  "/emergency-use-of-medical-oxygen": "19.99",
  "/use-and-administration-of-epinephrine-auto-injectors": "35.00",
};

export function splitCourseTitleLines(heading: string): string[] {
  const words = heading.trim().split(/\s+/);
  if (words.length <= 2) {
    return [heading];
  }

  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function buildCourseEnrollmentBarProps(
  heading: string,
  courseHeader: CourseHeaderContent,
  route: string,
): EnrollmentBarProps {
  const price = courseHeader.registerPrice || coursePricesByRoute[route] || "";
  const isOnline = courseHeader.classDetails.some((detail) =>
    detail.label.toLowerCase().includes("online"),
  );

  return {
    titleLines: courseEnrollmentTitlesByRoute[route] ?? splitCourseTitleLines(heading),
    variant: "register",
    availabilityLabel: isOnline ? "Available online" : undefined,
    priceNote: "Get certified today for just",
    price,
    totalPrice: price,
    registerLabel: price ? `Register for $${price}` : "Register",
    registerHref: courseHeader.registerUrl,
  };
}

export function getCourseEnrollmentBarProps(
  route: string,
  sections: { type: string; component?: string; props?: Record<string, unknown> }[],
): EnrollmentBarProps | null {
  const first = sections[0];
  if (first?.type !== "component" || first.component !== "Product Header 6") {
    return null;
  }

  const courseHeader = first.props?.courseHeader as CourseHeaderContent | undefined;
  const heading = first.props?.heading as string | undefined;
  if (!courseHeader || !heading) {
    return null;
  }

  return buildCourseEnrollmentBarProps(heading, courseHeader, route);
}
