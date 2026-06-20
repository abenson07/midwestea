export function checkoutDetailsUrl(classId: string, courseCode?: string): string {
  const params = new URLSearchParams({ classID: classId });
  if (courseCode) params.set("course_code", courseCode);
  return `/checkout/details?${params.toString()}`;
}
