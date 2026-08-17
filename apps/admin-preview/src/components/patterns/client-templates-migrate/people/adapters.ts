import type { PersonWithMembership } from "hooks";
import type { MemberRow, MembershipType, NeighborRow, VolunteerRow } from "./types";

/** Tag stored on `people.tags` to round-trip the "has volunteered before" flag — there's no dedicated column for it. */
export const VOLUNTEERED_BEFORE_TAG = "volunteered-before";

export type PeopleView = "members" | "neighbors" | "volunteers";

export function hookFiltersForView(view: PeopleView) {
  if (view === "members") {
    return { hasMembership: true as const, membershipStatus: "active" };
  }
  if (view === "volunteers") {
    return { role: "volunteer" };
  }
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

function membershipTypeFromTier(tier: string | null | undefined): MembershipType {
  const normalized = (tier ?? "").trim().toLowerCase();
  if (normalized === "household" || normalized === "individual" || normalized === "senior" || normalized === "student") {
    return normalized;
  }
  return "no-tier";
}

export function toMemberRow(person: PersonWithMembership): MemberRow {
  return {
    id: person.id,
    name: person.full_name,
    email: person.email ?? "—",
    membershipType: membershipTypeFromTier(person.membership?.tier),
    memberSince: formatDisplayDate(person.membership?.start_date ?? person.membership?.last_renewal),
  };
}

export function toNeighborRow(person: PersonWithMembership): NeighborRow {
  return {
    id: person.id,
    name: person.full_name,
    email: person.email ?? "—",
    address: person.address ?? "—",
    joinedDate: formatDisplayDate(person.created_at),
  };
}

export function toVolunteerRow(person: PersonWithMembership): VolunteerRow {
  const tags = person.tags ?? [];
  const otherRoles = (person.roles ?? []).filter((role) => role.toLowerCase() !== "volunteer");
  return {
    id: person.id,
    name: person.full_name,
    email: person.email ?? "—",
    hasVolunteeredBefore: tags.includes(VOLUNTEERED_BEFORE_TAG),
    interestArea: otherRoles[0] ?? tags.find((tag) => tag !== VOLUNTEERED_BEFORE_TAG) ?? "—",
  };
}
