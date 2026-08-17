import { loadEnvConfig } from "@next/env";

let diskEnvCache: Record<string, string | undefined> | null = null;

function getDiskEnv(): Record<string, string | undefined> {
  if (diskEnvCache) return diskEnvCache;
  try {
    const { combinedEnv } = loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
    diskEnvCache = combinedEnv;
  } catch {
    diskEnvCache = {};
  }
  return diskEnvCache;
}

/**
 * Webflow Data API Bearer token.
 * Prefer WEBFLOW_SITE_API_TOKEN (site-scoped token from Webflow); WEBFLOW_API_TOKEN is an alias.
 */
export function getWebflowApiToken(): string | undefined {
  const disk = getDiskEnv();
  return (
    process.env.WEBFLOW_SITE_API_TOKEN ??
    process.env.WEBFLOW_API_TOKEN ??
    disk.WEBFLOW_SITE_API_TOKEN ??
    disk.WEBFLOW_API_TOKEN
  )?.trim();
}

export function getWebflowEventsCollectionId(): string | undefined {
  const disk = getDiskEnv();
  return (
    process.env.WEBFLOW_EVENTS_COLLECTION_ID ??
    disk.WEBFLOW_EVENTS_COLLECTION_ID ??
    process.env.WEBFLOW_EVENT_COLLECTION_ID ??
    disk.WEBFLOW_EVENT_COLLECTION_ID
  )?.trim();
}

export function getWebflowBannersCollectionId(): string | undefined {
  const disk = getDiskEnv();
  return (process.env.WEBFLOW_BANNERS_COLLECTION_ID ?? disk.WEBFLOW_BANNERS_COLLECTION_ID)?.trim();
}

export function getWebflowVolunteerAsksCollectionId(): string | undefined {
  const disk = getDiskEnv();
  return (
    process.env.WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID ??
    disk.WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID
  )?.trim();
}

/** Committees CMS collection (events Reference field target). */
export function getWebflowCommitteesCollectionId(): string | undefined {
  const disk = getDiskEnv();
  return (
    process.env.WEBFLOW_COMMITTEES_COLLECTION_ID ?? disk.WEBFLOW_COMMITTEES_COLLECTION_ID
  )?.trim();
}

/** Same site id as `webflow:setup-banners --list-sites`. Required for CMS publish on localized Webflow sites. */
export function getWebflowSiteId(): string | undefined {
  const disk = getDiskEnv();
  return (process.env.WEBFLOW_SITE_ID ?? disk.WEBFLOW_SITE_ID)?.trim();
}
