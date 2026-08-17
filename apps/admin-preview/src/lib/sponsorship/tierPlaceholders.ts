import type { Sponsorships } from "@/types/database";

export const SPONSORSHIP_TIER_PLACEHOLDER_MEMO = "Tier placeholder";

export type SponsorshipTierSeed = {
  name: string;
  amount: number;
  quantity: number;
};

export function defaultSponsorshipTierSeeds(): SponsorshipTierSeed[] {
  return [
    { name: "Platinum", amount: 2500, quantity: 1 },
    { name: "Gold", amount: 1000, quantity: 2 },
    { name: "Silver", amount: 500, quantity: 4 },
    { name: "Bronze", amount: 250, quantity: 8 },
  ];
}

export function isSponsorshipTierPlaceholder(
  s: Pick<Sponsorships, "business_id" | "memo">,
): boolean {
  return s.memo === SPONSORSHIP_TIER_PLACEHOLDER_MEMO && !s.business_id;
}

export function extractTierSeedsFromSponsorships(
  sponsorships: Sponsorships[],
): SponsorshipTierSeed[] {
  return sponsorships
    .filter(isSponsorshipTierPlaceholder)
    .map((s) => ({
      name: (s.description ?? "").trim(),
      amount: s.amount ?? 0,
      quantity: s.quantity ?? 1,
    }))
    .filter((t) => t.name.length > 0 && t.amount > 0);
}

export function resolveSponsorshipTierSeeds(
  sponsorships: Sponsorships[],
): SponsorshipTierSeed[] {
  const fromDb = extractTierSeedsFromSponsorships(sponsorships);
  return fromDb.length > 0 ? fromDb : defaultSponsorshipTierSeeds();
}
