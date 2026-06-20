export function checkoutDetailsUrl(classId: string, courseCode?: string): string {
  const params = new URLSearchParams({ classID: classId });
  if (courseCode) params.set("course_code", courseCode);
  return `/checkout/details?${params.toString()}`;
}

/** Waitlist signup when no active class is open for registration. */
export function waitlistUrl(courseCode: string): string {
  const params = new URLSearchParams({ courseCode });
  return `/checkout/waitlist?${params.toString()}`;
}

/** Course detail page URL with class pre-selected (matches legacy Webflow gallery links). */
export function courseDetailUrlWithClass(
  route: string,
  classId: string,
  courseCode?: string
): string {
  const baseUrl = route.split("?")[0];
  const params = new URLSearchParams({ classID: classId });
  if (courseCode) params.set("course_code", courseCode);
  return `${baseUrl}?${params.toString()}`;
}
