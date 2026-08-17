"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  isSponsorshipTierPlaceholder,
  SPONSORSHIP_TIER_PLACEHOLDER_MEMO,
  type SponsorshipTierSeed,
} from "@/lib/sponsorship/tierPlaceholders";
import type { Sponsorships, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";

function eventTierPlaceholderRows(eventId: string, tiers: SponsorshipTierSeed[]) {
  return tiers.map((tier) => ({
    event_id: eventId,
    leaflet_id: null,
    business_id: null,
    description: tier.name,
    amount: tier.amount,
    quantity: tier.quantity,
    status: null,
    memo: SPONSORSHIP_TIER_PLACEHOLDER_MEMO,
  }));
}

export function useEventSponsorships(eventId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["sponsorships", "event", eventId] as const;

  const { data: sponsorships = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!supabaseClient || !eventId) return [];
      const { data, error: qError } = await supabaseClient
        .from("sponsorships")
        .select("*, businesses ( business_name, email )")
        .eq("event_id", eventId);
      if (qError) throw qError;
      return (data ?? []) as Sponsorships[];
    },
    enabled: Boolean(eventId),
  });

  const actual = sponsorships.filter((s) => !isSponsorshipTierPlaceholder(s));
  const pledged = actual.filter((s) => s.status === "pledged");
  const paid = actual.filter((s) => s.status === "paid");
  const raised = paid.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const pledgedAmount = pledged.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const goal = actual.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["sponsorships", "event"] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<SponsorshipsInsert, "event_id">) => {
      if (!supabaseClient || !eventId) throw new Error("Supabase client is not initialized");
      const { data, error: iError } = await supabaseClient
        .from("sponsorships")
        .insert({ ...payload, event_id: eventId, leaflet_id: null })
        .select("*, businesses ( business_name, email )")
        .single();
      if (iError) throw iError;
      return data as Sponsorships;
    },
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: SponsorshipsUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: uError } = await supabaseClient
        .from("sponsorships")
        .update(patch)
        .eq("id", id)
        .select("*, businesses ( business_name, email )")
        .single();
      if (uError) throw uError;
      return data as Sponsorships;
    },
    onSuccess: () => invalidate(),
  });

  const saveTiersMutation = useMutation({
    mutationFn: async (tiers: SponsorshipTierSeed[]) => {
      if (!supabaseClient || !eventId) {
        throw new Error("Supabase client is not initialized");
      }

      const { data: existing, error: fetchError } = await supabaseClient
        .from("sponsorships")
        .select("id, business_id, memo")
        .eq("event_id", eventId);
      if (fetchError) throw fetchError;

      const placeholderIds = (existing ?? [])
        .filter((s) => isSponsorshipTierPlaceholder(s))
        .map((s) => s.id);

      if (placeholderIds.length) {
        const { error: deleteError } = await supabaseClient
          .from("sponsorships")
          .delete()
          .in("id", placeholderIds);
        if (deleteError) throw deleteError;
      }

      if (tiers.length) {
        const { error: insertError } = await supabaseClient
          .from("sponsorships")
          .insert(eventTierPlaceholderRows(eventId, tiers));
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => invalidate(),
  });

  return {
    sponsorships,
    pledged,
    paid,
    raised,
    pledgedAmount,
    goal,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load sponsorships") : null,
    refetch: async () => {
      await refetch();
    },
    createSponsorship: (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) =>
      createMutation.mutateAsync(payload),
    updateSponsorship: (id: string, patch: SponsorshipsUpdate) =>
      updateMutation.mutateAsync({ id, patch }),
    saveSponsorshipTiers: (tiers: SponsorshipTierSeed[]) =>
      saveTiersMutation.mutateAsync(tiers),
  };
}
