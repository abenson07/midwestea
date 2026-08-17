"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { SponsorshipItemOfferings, SponsorshipItems } from "@/types/database";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";

export type OfferingLevel = {
  offeringId: string;
  itemId: string;
  name: string;
  amount: number;
  quantityAvailable: number;
  quantityFilled: number;
};

type OfferingRow = SponsorshipItemOfferings & { sponsorship_items: SponsorshipItems | null };

export type OfferingsParent = { eventId: string | null } | { leafletId: string | null };

function parentId(parent: OfferingsParent): string | null {
  return "eventId" in parent ? parent.eventId : parent.leafletId;
}

function parentQueryKeyPart(parent: OfferingsParent): string {
  return "eventId" in parent ? `event:${parent.eventId ?? ""}` : `leaflet:${parent.leafletId ?? ""}`;
}

/**
 * Reads/writes the live, editable "menu" of sponsorship_items offered by one
 * specific event or leaflet (`sponsorship_item_offerings`), plus how many of
 * each have actually sold (from real `sponsorships` rows referencing the
 * same catalog item). Replaces the old placeholder-row-in-`sponsorships` hack.
 */
export function useSponsorshipItemOfferings(parent: OfferingsParent) {
  const queryClient = useQueryClient();
  const id = parentId(parent);
  const isEvent = "eventId" in parent;
  const keyPart = parentQueryKeyPart(parent);

  const { data: offerings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sponsorship-item-offerings", keyPart],
    queryFn: async () => {
      if (!supabaseClient || !id) return [];
      const base = supabaseClient.from("sponsorship_item_offerings").select("*, sponsorship_items ( * )");
      const { data, error: qError } = isEvent ? await base.eq("event_id", id) : await base.eq("leaflet_id", id);
      if (qError) throw qError;
      return (data ?? []) as OfferingRow[];
    },
    enabled: Boolean(id),
  });

  const { data: sponsorshipItemIds = [] } = useQuery({
    queryKey: ["sponsorships-item-ids", keyPart],
    queryFn: async () => {
      if (!supabaseClient || !id) return [];
      const base = supabaseClient.from("sponsorships").select("sponsorship_item_id, status");
      const { data, error: qError } = isEvent ? await base.eq("event_id", id) : await base.eq("leaflet_id", id);
      if (qError) throw qError;
      return (data ?? []) as { sponsorship_item_id: string | null; status: string | null }[];
    },
    enabled: Boolean(id),
  });

  const levels: OfferingLevel[] = useMemo(() => {
    return offerings
      .filter((o) => o.sponsorship_items)
      .map((o) => {
        const item = o.sponsorship_items!;
        const filled = sponsorshipItemIds.filter(
          (s) =>
            s.sponsorship_item_id === item.id &&
            (s.status === "paid" || s.status === "pledged" || s.status === "invoiced"),
        ).length;
        return {
          offeringId: o.id,
          itemId: item.id,
          name: item.name,
          amount: item.amount,
          quantityAvailable: o.quantity_available,
          quantityFilled: filled,
        };
      });
  }, [offerings, sponsorshipItemIds]);

  const tierSeeds: SponsorshipTierSeed[] = useMemo(
    () => levels.map((l) => ({ name: l.name, amount: l.amount, quantity: l.quantityAvailable })),
    [levels],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["sponsorship-item-offerings", keyPart] });
    void queryClient.invalidateQueries({ queryKey: ["sponsorships-item-ids", keyPart] });
  };

  const saveTiersMutation = useMutation({
    mutationFn: async (tiers: SponsorshipTierSeed[]) => {
      if (!supabaseClient || !id) throw new Error("Supabase client is not initialized");

      const itemIds: string[] = [];
      for (const tier of tiers) {
        const { data: existingItem, error: findError } = await supabaseClient
          .from("sponsorship_items")
          .select("id, amount")
          .ilike("name", tier.name)
          .maybeSingle();
        if (findError) throw findError;

        if (existingItem) {
          if (existingItem.amount !== tier.amount) {
            const { error: updateError } = await supabaseClient
              .from("sponsorship_items")
              .update({ amount: tier.amount })
              .eq("id", existingItem.id);
            if (updateError) throw updateError;
          }
          itemIds.push(existingItem.id);
        } else {
          const { data: created, error: createError } = await supabaseClient
            .from("sponsorship_items")
            .insert({ name: tier.name, amount: tier.amount })
            .select("id")
            .single();
          if (createError) throw createError;
          itemIds.push(created.id);
        }
      }

      const deleteBase = supabaseClient.from("sponsorship_item_offerings").delete();
      const { error: deleteError } = isEvent
        ? await deleteBase.eq("event_id", id)
        : await deleteBase.eq("leaflet_id", id);
      if (deleteError) throw deleteError;

      if (tiers.length) {
        const rows = tiers.map((tier, i) => ({
          sponsorship_item_id: itemIds[i]!,
          event_id: isEvent ? id : null,
          leaflet_id: isEvent ? null : id,
          quantity_available: tier.quantity,
        }));
        const { error: insertError } = await supabaseClient.from("sponsorship_item_offerings").insert(rows);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => invalidate(),
  });

  return {
    levels,
    tierSeeds,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load sponsorship levels") : null,
    refetch: async () => {
      await refetch();
    },
    saveTiers: (tiers: SponsorshipTierSeed[]) => saveTiersMutation.mutateAsync(tiers),
  };
}
