import type { CommitteeSlug } from "schemas/committee_meetings";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";

const SLUGS = Object.keys(COMMITTEE_LABELS) as CommitteeSlug[];

/** Map website / Slack committee display names onto `committee_slug`. */
const NAME_TO_SLUG: Record<string, CommitteeSlug> = {
  events: "events",
  "events committee": "events",
  outreach: "outreach",
  "neighbor outreach": "outreach",
  "neighbor outreach committee": "outreach",
  advocacy: "outreach",
  hub: "hub",
  "emergency hub": "hub",
  "emergency-hub": "hub",
  leaflet: "leaflet",
  newsletter: "leaflet",
  communications: "communications",
  "communications committee": "communications",
  steering: "steering",
  "executive board": "executive_board",
  executive_board: "executive_board",
  businesses: "businesses",
  business: "businesses",
  "business committee": "businesses",
  "business-committee": "businesses",
};

export function isCommitteeSlug(value: unknown): value is CommitteeSlug {
  return typeof value === "string" && (SLUGS as string[]).includes(value);
}

/**
 * Resolve a website `committeeName` (or slug) to a `committee_slug`.
 * Falls back to `steering` when unknown / missing.
 */
export function committeeSlugFromName(name: string | null | undefined): CommitteeSlug {
  if (!name?.trim()) return "steering";
  const trimmed = name.trim();
  if (isCommitteeSlug(trimmed)) return trimmed;

  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (NAME_TO_SLUG[key]) return NAME_TO_SLUG[key];

  const withoutCommittee = key.replace(/\s*committee$/, "").trim();
  if (NAME_TO_SLUG[withoutCommittee]) return NAME_TO_SLUG[withoutCommittee];
  if (isCommitteeSlug(withoutCommittee)) return withoutCommittee;

  return "steering";
}

export function committeeDisplayName(slug: CommitteeSlug): string {
  return COMMITTEE_LABELS[slug] ?? slug;
}

/** Cards for the Admin-Migrate committees list (aligned with `committee_slug`). */
export type CommitteeHubCard = {
  id: CommitteeSlug;
  name: string;
  description: string;
};

export const COMMITTEE_HUB_CARDS: CommitteeHubCard[] = [
  {
    id: "events",
    name: "Events",
    description: "Plans community-wide gatherings like the Summer Social and holiday events.",
  },
  {
    id: "outreach",
    name: "Outreach",
    description: "Neighbor relationships, advocacy, and welcoming new residents.",
  },
  {
    id: "hub",
    name: "Emergency Hub",
    description: "Emergency preparedness and neighborhood hub coordination.",
  },
  {
    id: "leaflet",
    name: "Leaflet",
    description: "Neighborhood leaflet production and route distribution.",
  },
  {
    id: "communications",
    name: "Communications",
    description: "Newsletter, FAQ content, and public messaging.",
  },
  {
    id: "steering",
    name: "Steering",
    description: "Overall council direction and cross-committee coordination.",
  },
  {
    id: "executive_board",
    name: "Executive Board",
    description: "Board governance and leadership.",
  },
  {
    id: "businesses",
    name: "Businesses",
    description: "Local business relationships and sponsorships.",
  },
];
