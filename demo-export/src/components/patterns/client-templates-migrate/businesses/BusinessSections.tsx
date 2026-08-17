"use client";

import { DetailField, DetailRow, DetailSection, DetailSelectField } from "@/components/patterns/foundation/detail";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";
import { BusinessMembershipStatusToken } from "./BusinessMembershipStatusToken";
import { normalizeMembershipStatus } from "./adapters";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const MEMBERSHIP_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "past_due", label: "Past due" },
  { value: "lapsed", label: "Lapsed" },
];

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Contact info — editable inline, each field committing on blur. */
export function DetailsSection({
  business,
  onCommit,
}: {
  business: BusinessWithDetails;
  onCommit: (data: BusinessesUpdate) => void | Promise<void>;
}) {
  return (
    <DetailSection title="Details" isFirst>
      <DetailField
        label="Contact name"
        value={business.contact_name ?? ""}
        onCommit={(next) => onCommit({ contact_name: next.trim() || null })}
      />
      <DetailField
        label="Phone"
        value={business.phone ?? ""}
        onCommit={(next) => onCommit({ phone: next.trim() || null })}
      />
      <DetailField
        label="Email"
        value={business.email ?? ""}
        onCommit={(next) => onCommit({ email: next.trim() || null })}
      />
      <DetailField
        label="Address"
        value={business.address ?? ""}
        onCommit={(next) => onCommit({ address: next.trim() || null })}
      />
      <DetailField
        label="Website"
        value={business.website ?? ""}
        onCommit={(next) => onCommit({ website: next.trim() || null })}
      />
    </DetailSection>
  );
}

/** Only renders when the business has a linked business_memberships record. */
export function MembershipSection({
  business,
  onCommit,
}: {
  business: BusinessWithDetails;
  onCommit: (data: BusinessMembershipsUpdate) => void | Promise<void>;
}) {
  const membership = business.membership;
  if (!membership) return null;

  return (
    <DetailSection title="Membership">
      <DetailSelectField
        label="Status"
        value={normalizeMembershipStatus(membership.status)}
        options={MEMBERSHIP_STATUS_OPTIONS}
        onCommit={(next) => onCommit({ status: next })}
      />
      <DetailRow
        label="Renews"
        value={formatDisplayDate(membership.last_renewal)}
        valueContent={
          <BusinessMembershipStatusToken status={normalizeMembershipStatus(membership.status)} />
        }
      />
    </DetailSection>
  );
}

/** Only renders when the business has sponsorship records. */
export function SponsorshipHistorySection({ business }: { business: BusinessWithDetails }) {
  const sponsorships = business.sponsorships ?? [];
  if (sponsorships.length === 0) return null;

  return (
    <DetailSection title="Sponsorship history">
      {sponsorships.map((sponsorship) => (
        <DetailRow
          key={sponsorship.id}
          label={sponsorship.status ? sponsorship.status : "Sponsorship"}
          valueContent={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 510, color: "var(--linear-color-ink)" }}>
                {currencyFormatter.format(sponsorship.amount ?? 0)}
              </span>
              {sponsorship.paid_date ? (
                <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                  {formatDisplayDate(sponsorship.paid_date)}
                </span>
              ) : null}
            </div>
          }
        />
      ))}
    </DetailSection>
  );
}
