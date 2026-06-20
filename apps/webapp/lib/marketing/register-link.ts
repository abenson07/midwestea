/** Placeholder until Supabase enrichment supplies a checkout URL. */
export const REGISTER_URL_PENDING = "#";

/** External payment links open in a new tab; internal checkout stays in-app. */
export function registerLinkAttributes(href: string): {
  target?: "_blank";
  rel?: string;
} {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { target: "_blank", rel: "noreferrer" };
  }
  return {};
}
