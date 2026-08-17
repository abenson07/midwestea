import { webflowJson } from "@/lib/webflow/client";
import { getWebflowSiteId } from "@/lib/webflow/env";
import { getSiteCmsLocaleIds } from "@/lib/webflow/siteLocales";

export type PublishCollectionItemsOptions = {
  /** When set (e.g. from getBannerLocaleContext), publish uses `items` + cmsLocaleIds for localized sites. */
  cmsLocaleIds?: string[];
};

/**
 * Publish collection items so staged CMS updates appear on the live Webflow site.
 * Localized Webflow sites must publish with `items` + cmsLocaleIds; plain `itemIds` returns 404.
 */
export async function publishCollectionItemIds(
  token: string,
  collectionId: string,
  itemIds: string[],
  options?: PublishCollectionItemsOptions
): Promise<void> {
  if (itemIds.length === 0) return;

  let cmsLocaleIds = options?.cmsLocaleIds?.filter(Boolean);
  if (!cmsLocaleIds?.length) {
    const siteId = getWebflowSiteId();
    if (siteId) {
      try {
        cmsLocaleIds = await getSiteCmsLocaleIds(token, siteId);
      } catch {
        cmsLocaleIds = [];
      }
    }
  }

  const body =
    cmsLocaleIds && cmsLocaleIds.length > 0
      ? {
          items: itemIds.map((id) => ({
            id,
            cmsLocaleIds,
          })),
        }
      : { itemIds };

  await webflowJson<unknown>(
    token,
    `/collections/${collectionId}/items/publish`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}
