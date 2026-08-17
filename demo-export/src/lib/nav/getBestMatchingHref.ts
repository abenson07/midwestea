import { normalizeRoute } from "@/lib/favorites/normalizeRoute";

/**
 * Finds the href among `hrefs` that best matches `currentRoute`. When multiple
 * hrefs match (e.g. an "Overview" item at the section root and a sibling item
 * one level deeper, or a plain page and a query-string favorite of a filtered
 * view of that same page), the most specific (longest / exact) match wins so
 * ancestor entries don't stay highlighted once a more specific sibling is
 * selected.
 */
export function getBestMatchingHref(
  currentRoute: string,
  hrefs: (string | undefined)[],
): string | undefined {
  const normalizedCurrent = normalizeRoute(currentRoute);
  const qIndex = normalizedCurrent.indexOf("?");
  const currentPath =
    qIndex >= 0 ? normalizedCurrent.slice(0, qIndex) : normalizedCurrent;

  let bestHref: string | undefined;
  let bestLength = -1;

  for (const href of hrefs) {
    if (!href || href === "#") continue;

    const normalizedHref = normalizeRoute(href);

    if (normalizedCurrent === normalizedHref) return href;
    if (normalizedHref.includes("?")) continue;

    const matches =
      currentPath === normalizedHref || currentPath.startsWith(`${normalizedHref}/`);

    if (matches && normalizedHref.length > bestLength) {
      bestHref = href;
      bestLength = normalizedHref.length;
    }
  }

  return bestHref;
}
