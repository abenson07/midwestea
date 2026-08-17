import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";

/** Map admin-migrate URL / mock ids onto real CommitteeSlug values. */
const SLUG_ALIASES: Record<string, CommitteeSlug> = {
  events: "events",
  outreach: "outreach",
  hub: "hub",
  "emergency-hub": "hub",
  leaflet: "leaflet",
  newsletter: "leaflet",
  communications: "communications",
  steering: "steering",
  executive_board: "executive_board",
  "executive-board": "executive_board",
  businesses: "businesses",
  "business-committee": "businesses",
  // Mock-only ids remapped to closest real committees
  finance: "steering",
  volunteer: "events",
  advocacy: "outreach",
};

export function resolveCommitteeSlug(id: string): CommitteeSlug | null {
  const key = id.trim().toLowerCase();
  if (key in COMMITTEE_LABELS) return key as CommitteeSlug;
  return SLUG_ALIASES[key] ?? null;
}

export function committeeDisplayName(slug: CommitteeSlug): string {
  return COMMITTEE_LABELS[slug] ?? slug;
}
