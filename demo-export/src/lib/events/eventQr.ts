/**
 * Event QR helpers — destination URLs with tracking params so scans
 * can be attributed to a specific QR (flyer, poster, email, etc.).
 */

export type EventQrLink = {
  id: string;
  /** Short note shown in event settings (e.g. "Park flyer"). */
  description?: string;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function eventPublicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://mapleleafcommunity.org"
  );
}

export function eventPageUrl(slug: string | null | undefined): string | null {
  if (!slug?.trim()) return null;
  return `${eventPublicBaseUrl()}/events/${slug.trim()}`;
}

export type BuildEventQrUrlOptions = {
  /** Destination page (defaults to the event public page when slug is given). */
  baseUrl: string;
  /** Event slug — used as utm_campaign. */
  campaign?: string | null;
  /** QR label — used as utm_content so individual codes are distinguishable. */
  content?: string | null;
};

/**
 * Appends standard event QR tracking params without clobbering existing ones.
 * Pattern mirrors leaflet membership QRs (`utm_source` + `utm_campaign`).
 */
export function buildEventQrUrl({
  baseUrl,
  campaign,
  content,
}: BuildEventQrUrlOptions): string {
  const url = new URL(baseUrl);
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "event");
  }
  if (!url.searchParams.has("utm_medium")) {
    url.searchParams.set("utm_medium", "qr");
  }
  const campaignSlug = campaign ? slugify(campaign) : "";
  if (campaignSlug && !url.searchParams.has("utm_campaign")) {
    url.searchParams.set("utm_campaign", campaignSlug);
  }
  const contentSlug = content ? slugify(content) : "";
  if (contentSlug && !url.searchParams.has("utm_content")) {
    url.searchParams.set("utm_content", contentSlug);
  }
  return url.href;
}

/** Resolve linked QR refs from field_data, including legacy `qr_code_id`. */
export function resolveEventQrLinks(fieldData: {
  qr_code_id?: string;
  qr_codes?: EventQrLink[];
}): EventQrLink[] {
  const fromArray = Array.isArray(fieldData.qr_codes) ? fieldData.qr_codes : [];
  const seen = new Set<string>();
  const links: EventQrLink[] = [];

  for (const link of fromArray) {
    if (!link?.id || seen.has(link.id)) continue;
    seen.add(link.id);
    links.push({
      id: link.id,
      description:
        typeof link.description === "string" && link.description.trim()
          ? link.description.trim()
          : undefined,
    });
  }

  if (fieldData.qr_code_id && !seen.has(fieldData.qr_code_id)) {
    links.unshift({ id: fieldData.qr_code_id });
  }

  return links;
}

export function withEventQrLinks(
  fieldData: Record<string, unknown>,
  links: EventQrLink[],
): Record<string, unknown> {
  const primary = links[0]?.id;
  return {
    ...fieldData,
    qr_codes: links,
    ...(primary ? { qr_code_id: primary } : {}),
  };
}
