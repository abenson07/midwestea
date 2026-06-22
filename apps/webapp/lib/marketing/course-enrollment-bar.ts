import type { EnrollmentBarProps } from "@/components/marketing/enrollment-bar";
import type { CourseHeaderContent } from "@/components/marketing/product-header-6";

/** Title line overrides for courses whose headings don't split cleanly. */
const courseEnrollmentTitlesByRoute: Record<string, string[]> = {
  "/active-shooter-training": ["Active Violence", "Emergency Response"],
  "/emergency-use-of-medical-oxygen": ["Emergency Use", "of Medical Oxygen"],
  "/use-and-administration-of-epinephrine-auto-injectors": ["Epinephrine"],
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
  const price = courseHeader.registerPrice ?? "";
  const isOnline = courseHeader.classDetails.some((detail) =>
    detail.label.toLowerCase().includes("online"),
  );
  const isWaitlist = courseHeader.variant === "waitlist";

  if (isWaitlist) {
    return {
      titleLines: courseEnrollmentTitlesByRoute[route] ?? splitCourseTitleLines(heading),
      variant: "waitlist",
      priceNote: "Get certified today for just",
      price,
      waitlistLabel: courseHeader.waitlistLabel ?? "Join waitlist",
      waitlistHref: courseHeader.waitlistHref ?? courseHeader.registerUrl,
    };
  }

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
