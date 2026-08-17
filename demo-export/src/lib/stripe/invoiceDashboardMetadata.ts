import type Stripe from "stripe";

/**
 * Stripe invoice.metadata for sponsorship invoices created from this dashboard.
 * Values are stored on the Invoice object at creation time.
 */
export const DASHBOARD_CREATED_VALUE = "Dashboard";

export const INVOICE_CATEGORY_LABEL = {
  EVENT: "Event Sponsorship",
  LEAFLET: "Leaflet Sponsorship",
} as const;

export type InvoiceCategorySlug = "event" | "leaflet";

export const METADATA_KEYS = {
  category: "category",
  created: "created",
  createdBy: "created_by",
  /** Webflow Events CMS item id when category is event sponsorship. */
  eventId: "event_id",
  /** Display name at issue time (from Webflow). */
  eventName: "event_name",
  leafletId: "leaflet_id",
  sponsorshipId: "sponsorship_id",
} as const;

export function categorySlugToLabel(slug: InvoiceCategorySlug): string {
  return slug === "event"
    ? INVOICE_CATEGORY_LABEL.EVENT
    : INVOICE_CATEGORY_LABEL.LEAFLET;
}

function isKnownCategory(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value === INVOICE_CATEGORY_LABEL.EVENT ||
    value === INVOICE_CATEGORY_LABEL.LEAFLET
  );
}

/** Only invoices created through this flow (full tag set) appear in the billing list. */
export function invoiceHasDashboardTags(
  metadata: Stripe.Metadata | null | undefined
): boolean {
  if (!metadata) return false;
  if (metadata[METADATA_KEYS.created] !== DASHBOARD_CREATED_VALUE)
    return false;
  if (!metadata[METADATA_KEYS.createdBy]?.trim()) return false;
  return isKnownCategory(metadata[METADATA_KEYS.category]?.trim());
}
