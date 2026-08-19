/** Normalize a route for consistent favorite matching (pathname + optional search). */
export function normalizeRoute(route: string): string {
  const trimmed = route.trim();
  if (!trimmed) return "";

  const qIndex = trimmed.indexOf("?");
  const pathname = qIndex >= 0 ? trimmed.slice(0, qIndex) : trimmed;
  const search = qIndex >= 0 ? trimmed.slice(qIndex) : "";

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  return `${normalizedPath}${search}`;
}
