import { getWebflowSiteId } from "@/lib/webflow/env";
import { webflowJson } from "@/lib/webflow/client";

type SiteLocalesResponse = {
  locales?: {
    primary?: { cmsLocaleId?: string };
    secondary?: Array<{ cmsLocaleId?: string }>;
  };
};

/** Primary first, then secondary — matches Webflow “Get Site” locales shape. */
export function mergeSiteLocaleIds(site: SiteLocalesResponse): string[] {
  const ids: string[] = [];
  const p = site.locales?.primary?.cmsLocaleId;
  if (p) ids.push(p);
  for (const s of site.locales?.secondary ?? []) {
    const id = s?.cmsLocaleId;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export async function getSiteCmsLocaleIds(
  token: string,
  siteId: string
): Promise<string[]> {
  const site = await webflowJson<SiteLocalesResponse>(
    token,
    `/sites/${encodeURIComponent(siteId)}`,
    { method: "GET" }
  );
  return mergeSiteLocaleIds(site);
}

/**
 * When WEBFLOW_SITE_ID is set, loads CMS locale ids for create/update/publish
 * on localized sites (Data API requires cmsLocaleId + locale-aware publish).
 */
export async function getBannerLocaleContext(token: string): Promise<{
  cmsLocaleId?: string;
  cmsLocaleIds: string[];
}> {
  const siteId = getWebflowSiteId();
  if (!siteId) return { cmsLocaleIds: [] };
  try {
    const cmsLocaleIds = await getSiteCmsLocaleIds(token, siteId);
    return {
      cmsLocaleIds,
      cmsLocaleId: cmsLocaleIds[0],
    };
  } catch {
    return { cmsLocaleIds: [] };
  }
}
