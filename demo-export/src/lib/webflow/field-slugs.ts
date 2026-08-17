/**
 * Default field slugs for the Webflow "Site banners" CMS collection.
 * Override with WEBFLOW_BANNER_FIELD_* env vars if your Designer slugs differ.
 */
export type BannerFieldSlugs = {
  message: string;
  linkUrl: string;
  active: string;
  expiresAt: string;
  urgent: string;
  urgentUntil: string;
  editorNotes: string;
};

export function getBannerFieldSlugs(): BannerFieldSlugs {
  return {
    message: process.env.WEBFLOW_BANNER_FIELD_MESSAGE ?? "message",
    linkUrl: process.env.WEBFLOW_BANNER_FIELD_LINK_URL ?? "link-url",
    active: process.env.WEBFLOW_BANNER_FIELD_ACTIVE ?? "active",
    expiresAt: process.env.WEBFLOW_BANNER_FIELD_EXPIRES_AT ?? "expires-at",
    urgent: process.env.WEBFLOW_BANNER_FIELD_URGENT ?? "urgent",
    urgentUntil: process.env.WEBFLOW_BANNER_FIELD_URGENT_UNTIL ?? "urgent-until",
    editorNotes: process.env.WEBFLOW_BANNER_FIELD_EDITOR_NOTES ?? "editor-notes",
  };
}
