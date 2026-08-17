import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { INVOICE_CATEGORY_LABEL } from "@/lib/stripe/invoiceDashboardMetadata";
import type { Sponsorships } from "schemas/sponsorships";
import {
  CURATED_DEMO_EVENT_IDS,
  sampleEventSponsorsById,
  sampleEventSponsorshipInvoicesById,
  sampleEvents,
  type CuratedDemoEventId,
  type EventSponsorshipInvoiceRow,
  type EventSponsorRow,
} from "@/data/mocks/events";
import {
  sampleLeafletDetail,
  sampleLeafletSponsors,
  sampleLeafletSponsorshipInvoices,
  type LeafletSponsorshipInvoiceRow,
  type LeafletSponsorRow,
} from "@/data/mocks/leaflets";

/** Demo-mode sponsorship row for `/admin` invoicing (matches `SponsorshipWithParent`). */
export type DemoSponsorshipRow = Sponsorships & {
  businesses?: { business_name: string | null; email: string | null } | null;
  parentType: "event" | "leaflet" | null;
  parentLabel: string;
  parentYear: number | null;
};

/** Parse display money like "$2,500.00" / "$200" into dollars. In-kind / empty → 0. */
export function parseUsdDollars(amount: string): number {
  const cleaned = amount.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  return Number.parseFloat(cleaned) || 0;
}

function businessEmail(businessName: string): string {
  const local = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${local || "sponsor"}@example.com`;
}

/** "Jul 20, 2026" → unix seconds at local noon. */
function parseDisplayDateToUnix(dueDate: string): number {
  const ms = Date.parse(dueDate);
  if (Number.isNaN(ms)) return Math.floor(Date.now() / 1000);
  return Math.floor(ms / 1000);
}

function invoiceStatusFromMock(
  status: EventSponsorshipInvoiceRow["status"],
): "paid" | "open" {
  return status === "Paid" ? "paid" : "open";
}

function sponsorshipStatusFromInvoice(
  status: EventSponsorshipInvoiceRow["status"],
): "paid" | "invoiced" {
  return status === "Paid" ? "paid" : "invoiced";
}

function sponsorshipStatusFromSponsor(
  status: EventSponsorRow["status"] | LeafletSponsorRow["status"],
  hasInvoice: boolean,
  invoiceStatus?: EventSponsorshipInvoiceRow["status"],
): "pledged" | "invoiced" | "paid" {
  if (status === "Declined") return "pledged";
  if (status === "Pending") return hasInvoice ? "invoiced" : "pledged";
  if (hasInvoice && invoiceStatus) return sponsorshipStatusFromInvoice(invoiceStatus);
  // Confirmed in-kind / $0 with no invoice counts as fulfilled.
  return "paid";
}

function eventTitle(eventId: string): string {
  return sampleEvents.find((e) => e.id === eventId)?.title ?? "Unknown event";
}

function toStripeInvoiceRow(args: {
  row: EventSponsorshipInvoiceRow | LeafletSponsorshipInvoiceRow;
  category: typeof INVOICE_CATEGORY_LABEL.EVENT | typeof INVOICE_CATEGORY_LABEL.LEAFLET;
  eventId: string | null;
  eventName: string | null;
  leafletId: string | null;
  sponsorshipId: string;
}): StripeInvoiceTableRow {
  const due = parseDisplayDateToUnix(args.row.dueDate);
  const amountCents = Math.round(parseUsdDollars(args.row.amount) * 100);
  return {
    id: args.row.id,
    number: args.row.invoiceNumber,
    status: invoiceStatusFromMock(args.row.status),
    customer_email: businessEmail(args.row.business),
    amount_due: amountCents,
    due_date: due,
    created: due - 14 * 24 * 60 * 60,
    hosted_invoice_url: null,
    catalog_product_ids: [],
    sponsorship_category: args.category,
    created_by_name: "Demo",
    event_id: args.eventId,
    event_name: args.eventName,
    leaflet_id: args.leafletId,
    sponsorship_id: args.sponsorshipId,
  };
}

function eventInvoiceSponsorshipId(invoiceId: string): string {
  return invoiceId.replace(/^spon-inv-/, "spon-demo-");
}

function leafletInvoiceSponsorshipId(invoiceId: string): string {
  return invoiceId.replace(/^lf-inv-/, "lf-spon-demo-");
}

/** Flat Stripe-shaped invoice list for `/admin` invoicing in demo mode. */
export const sampleStripeInvoices: StripeInvoiceTableRow[] = [
  ...CURATED_DEMO_EVENT_IDS.flatMap((eventId) => {
    const title = eventTitle(eventId);
    return (sampleEventSponsorshipInvoicesById[eventId] ?? []).map((row) =>
      toStripeInvoiceRow({
        row,
        category: INVOICE_CATEGORY_LABEL.EVENT,
        eventId,
        eventName: title,
        leafletId: null,
        sponsorshipId: eventInvoiceSponsorshipId(row.id),
      }),
    );
  }),
  ...sampleLeafletSponsorshipInvoices.map((row) =>
    toStripeInvoiceRow({
      row,
      category: INVOICE_CATEGORY_LABEL.LEAFLET,
      eventId: null,
      eventName: null,
      leafletId: sampleLeafletDetail.id,
      sponsorshipId: leafletInvoiceSponsorshipId(row.id),
    }),
  ),
];

function findEventInvoice(
  eventId: CuratedDemoEventId,
  sponsor: EventSponsorRow,
): EventSponsorshipInvoiceRow | undefined {
  return sampleEventSponsorshipInvoicesById[eventId].find(
    (inv) => inv.business === sponsor.name && inv.level === sponsor.tier,
  );
}

function findLeafletInvoice(
  sponsor: LeafletSponsorRow,
): LeafletSponsorshipInvoiceRow | undefined {
  return sampleLeafletSponsorshipInvoices.find(
    (inv) => inv.business === sponsor.name && inv.level === sponsor.tier,
  );
}

function toSponsorshipRow(args: {
  id: string;
  businessName: string;
  tier: string;
  amountDollars: number;
  status: "pledged" | "invoiced" | "paid";
  parentType: "event" | "leaflet";
  parentLabel: string;
  parentYear: number;
  eventId: string | null;
  leafletId: string | null;
}): DemoSponsorshipRow {
  return {
    id: args.id,
    business_id: `biz-demo-${args.id}`,
    event_id: args.eventId,
    leaflet_id: args.leafletId,
    amount: args.amountDollars,
    status: args.status,
    memo: null,
    paid_date: args.status === "paid" ? "2026-07-20" : null,
    description: args.tier,
    image_url: null,
    quantity: 1,
    sponsorship_item_id: null,
    businesses: {
      business_name: args.businessName,
      email: businessEmail(args.businessName),
    },
    parentType: args.parentType,
    parentLabel: args.parentLabel,
    parentYear: args.parentYear,
  };
}

/** Sponsorship rows for `/admin` invoicing sponsorships tab + overview chart (demo only). */
export const sampleSponsorships: DemoSponsorshipRow[] = [
  ...CURATED_DEMO_EVENT_IDS.flatMap((eventId) => {
    const title = eventTitle(eventId);
    return (sampleEventSponsorsById[eventId] ?? []).map((sponsor) => {
      const invoice = findEventInvoice(eventId, sponsor);
      const amountDollars = invoice ? parseUsdDollars(invoice.amount) : 0;
      return toSponsorshipRow({
        id: sponsor.id,
        businessName: sponsor.name,
        tier: sponsor.tier,
        amountDollars,
        status: sponsorshipStatusFromSponsor(sponsor.status, Boolean(invoice), invoice?.status),
        parentType: "event",
        parentLabel: title,
        parentYear: 2026,
        eventId,
        leafletId: null,
      });
    });
  }),
  ...sampleLeafletSponsors.map((sponsor) => {
    const invoice = findLeafletInvoice(sponsor);
    const amountDollars = invoice ? parseUsdDollars(invoice.amount) : 0;
    return toSponsorshipRow({
      id: sponsor.id,
      businessName: sponsor.name,
      tier: sponsor.tier,
      amountDollars,
      status: sponsorshipStatusFromSponsor(sponsor.status, Boolean(invoice), invoice?.status),
      parentType: "leaflet",
      parentLabel: sampleLeafletDetail.title,
      parentYear: 2026,
      eventId: null,
      leafletId: sampleLeafletDetail.id,
    });
  }),
];
