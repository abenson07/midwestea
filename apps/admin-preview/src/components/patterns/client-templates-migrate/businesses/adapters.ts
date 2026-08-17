import type { BusinessWithDetails } from "hooks";
import type { BusinessMemberRow, BusinessMembershipStatus, BusinessRow, SponsorRow, SponsorshipLevel } from "./types";

export type BusinessesView = "members" | "sponsors" | "all";

export function hookFiltersForView(view: BusinessesView) {
  if (view === "members") return { isMember: true as const };
  if (view === "sponsors") return { isPastSponsor: true as const };
  return {};
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Real `business_memberships.status` is a free-form enum; normalize into the four statuses this screen renders. */
export function normalizeMembershipStatus(status: string | null | undefined): BusinessMembershipStatus {
  const normalized = (status ?? "").trim().toLowerCase();
  if (normalized.includes("past") || normalized.includes("due")) return "past_due";
  if (normalized.includes("pend")) return "pending";
  if (normalized.includes("lapse") || normalized.includes("expire") || normalized.includes("cancel")) return "lapsed";
  if (normalized.includes("active")) return "active";
  return "pending";
}

/** Real `sponsorships` has no stored "level" — bucket by amount using the same thresholds the leaflet sponsorship-tier seeds use (`src/lib/sponsorship/tierPlaceholders.ts`). */
function sponsorshipLevelFromAmount(amount: number): SponsorshipLevel {
  if (amount >= 2500) return "platinum";
  if (amount >= 1000) return "gold";
  if (amount >= 500) return "silver";
  return "bronze";
}

export function toBusinessRow(business: BusinessWithDetails): BusinessRow {
  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    // Real `businesses` has no category column — nothing to source this from yet.
    category: "—",
    contactName: business.contact_name ?? "—",
    phone: business.phone ?? "—",
  };
}

export function toBusinessMemberRow(business: BusinessWithDetails): BusinessMemberRow {
  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    // Real `business_memberships` has no tier column.
    tier: "—",
    renewalDate: formatDisplayDate(business.membership?.last_renewal),
    status: normalizeMembershipStatus(business.membership?.status),
    memberSince: formatDisplayDate(business.membership?.last_renewal),
    // Real `business_memberships` has no dues-amount column.
    annualDues: 0,
  };
}

export function toSponsorRow(business: BusinessWithDetails): SponsorRow {
  const sponsorships = business.sponsorships ?? [];
  const dated = sponsorships.filter((s) => s.paid_date);
  const mostRecent = [...dated].sort((a, b) => (b.paid_date! < a.paid_date! ? -1 : 1))[0] ?? sponsorships[0];
  const earliest = [...dated].sort((a, b) => (a.paid_date! < b.paid_date! ? -1 : 1))[0] ?? sponsorships[0];
  const amount = mostRecent?.amount ?? 0;

  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    sponsorshipLevel: sponsorshipLevelFromAmount(amount),
    amount,
    lastSponsoredYear: mostRecent?.paid_date ? new Date(mostRecent.paid_date).getFullYear() : new Date().getFullYear(),
    sponsorSince: formatDisplayDate(earliest?.paid_date),
  };
}
