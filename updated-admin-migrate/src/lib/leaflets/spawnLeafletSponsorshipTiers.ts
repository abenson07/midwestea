import type { SupabaseClient } from "@supabase/supabase-js";
import {
  defaultSponsorshipTierSeeds,
  SPONSORSHIP_TIER_PLACEHOLDER_MEMO,
  type SponsorshipTierSeed,
} from "@/lib/sponsorship/tierPlaceholders";

export function tierPlaceholderRows(
  leafletId: string,
  tiers: SponsorshipTierSeed[],
) {
  return tiers.map((tier) => ({
    leaflet_id: leafletId,
    event_id: null,
    business_id: null,
    description: tier.name,
    amount: tier.amount,
    quantity: tier.quantity,
    status: null,
    memo: SPONSORSHIP_TIER_PLACEHOLDER_MEMO,
  }));
}

export async function spawnLeafletSponsorshipTiers(
  supabase: SupabaseClient,
  leafletId: string,
  seeds?: SponsorshipTierSeed[],
): Promise<void> {
  const tiers = seeds?.length ? seeds : defaultSponsorshipTierSeeds();
  const { error } = await supabase
    .from("sponsorships")
    .insert(tierPlaceholderRows(leafletId, tiers));
  if (error) throw new Error(error.message);
}
