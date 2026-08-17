"use client";

import { DetailField, DetailRow, DetailSection, DetailSelectField } from "@/components/patterns/foundation/detail";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import { VOLUNTEERED_BEFORE_TAG } from "./adapters";

const MEMBERSHIP_TIER_OPTIONS = [
  { value: "household", label: "Household" },
  { value: "individual", label: "Individual" },
  { value: "senior", label: "Senior" },
  { value: "student", label: "Student" },
];

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

/** Email, phone, address — editable inline, each field committing on blur. */
export function ContactSection({
  person,
  onCommit,
}: {
  person: PersonWithMembership;
  onCommit: (data: PeopleUpdate) => void | Promise<void>;
}) {
  return (
    <DetailSection title="Contact" isFirst>
      <DetailField
        label="Email"
        value={person.email ?? ""}
        onCommit={(next) => onCommit({ email: next.trim() || null })}
      />
      <DetailField
        label="Phone"
        value={person.phone ?? ""}
        onCommit={(next) => onCommit({ phone: next.trim() || null })}
      />
      <DetailField
        label="Address"
        value={person.address ?? ""}
        onCommit={(next) => onCommit({ address: next.trim() || null })}
      />
      {person.is_executive_board ? <DetailRow label="Executive board" value="Yes" /> : null}
    </DetailSection>
  );
}

/** Only renders when the person has a linked membership record. */
export function MembershipSection({
  person,
  onCommit,
}: {
  person: PersonWithMembership;
  onCommit: (data: MembershipsUpdate) => void | Promise<void>;
}) {
  const membership = person.membership;
  if (!membership) return null;

  return (
    <DetailSection title="Membership">
      <DetailSelectField
        label="Tier"
        value={membership.tier}
        options={MEMBERSHIP_TIER_OPTIONS}
        onCommit={(next) => onCommit({ tier: next })}
      />
      <DetailSelectField
        label="Status"
        value={membership.status}
        options={MEMBERSHIP_STATUS_OPTIONS}
        onCommit={(next) => onCommit({ status: next })}
      />
      <DetailRow
        label="Member since"
        value={formatDisplayDate(membership.start_date ?? membership.last_renewal)}
      />
    </DetailSection>
  );
}

/** Only renders when the person is tagged/rostered as a volunteer. */
export function VolunteerSection({ person }: { person: PersonWithMembership }) {
  const roles = person.roles ?? [];
  const tags = person.tags ?? [];
  const isVolunteer = roles.some((role) => role.toLowerCase() === "volunteer");
  if (!isVolunteer) return null;

  const hasVolunteeredBefore = tags.includes(VOLUNTEERED_BEFORE_TAG);
  const interestArea = tags.find((tag) => tag !== VOLUNTEERED_BEFORE_TAG);

  return (
    <DetailSection title="Volunteering">
      <DetailRow
        label="Experience"
        value={hasVolunteeredBefore ? "Has volunteered before" : "Interested, not yet volunteered"}
      />
      {interestArea ? <DetailRow label="Interest area" value={interestArea} /> : null}
    </DetailSection>
  );
}
