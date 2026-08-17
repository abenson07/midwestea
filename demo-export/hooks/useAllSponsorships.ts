"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import { isSponsorshipTierPlaceholder } from "@/lib/sponsorship/tierPlaceholders";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleSponsorships } from "@/data/mocks/invoices";
import { useEvents } from "./useEvents";
import { useLeaflets } from "./useLeaflets";
import type { Sponsorships, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";

export type SponsorshipParentType = "event" | "leaflet";

export type SponsorshipWithParent = Sponsorships &
  Record<string, unknown> & {
    businesses?: { business_name: string | null; email: string | null } | null;
    parentType: SponsorshipParentType | null;
    parentLabel: string;
    parentYear: number | null;
  };

export const ALL_SPONSORSHIPS_QUERY_KEY = ["sponsorships", "all"] as const;

async function fetchAllSponsorships(): Promise<Sponsorships[]> {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("sponsorships")
    .select("*, businesses ( business_name, email )");
  if (error) throw error;
  return (data ?? []) as Sponsorships[];
}

export function useAllSponsorships() {
  const queryClient = useQueryClient();
  const { enabled: demo } = useDemoModeOptional();
  const { events } = useEvents();
  const { leaflets } = useLeaflets();

  const { data: rawSponsorships = [], isLoading, error, refetch } = useQuery({
    queryKey: ALL_SPONSORSHIPS_QUERY_KEY,
    queryFn: fetchAllSponsorships,
    enabled: !demo,
  });

  const sponsorships = useMemo<SponsorshipWithParent[]>(() => {
    if (demo) return sampleSponsorships as SponsorshipWithParent[];
    return rawSponsorships
      .filter((s) => !isSponsorshipTierPlaceholder(s))
      .map((s) => {
        if (s.event_id) {
          const event = events.find((e) => e.id === s.event_id);
          return {
            ...s,
            parentType: "event" as const,
            parentLabel: event?.title ?? "Unknown event",
            parentYear: event?.date ? new Date(event.date).getFullYear() : null,
          };
        }
        if (s.leaflet_id) {
          const leaflet = leaflets.find((l) => l.id === s.leaflet_id);
          return {
            ...s,
            parentType: "leaflet" as const,
            parentLabel: leaflet?.title ?? "Unknown leaflet",
            parentYear: leaflet?.distribution_date
              ? new Date(leaflet.distribution_date).getFullYear()
              : null,
          };
        }
        return { ...s, parentType: null, parentLabel: "Unassigned", parentYear: null };
      });
  }, [demo, rawSponsorships, events, leaflets]);
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ALL_SPONSORSHIPS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["sponsorships", "event"] });
    void queryClient.invalidateQueries({ queryKey: ["sponsorships", "leaflet"] });
  };

  const createMutation = useMutation({
    mutationFn: async ({
      eventId,
      leafletId,
      payload,
    }: {
      eventId?: string | null;
      leafletId?: string | null;
      payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">;
    }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: iError } = await supabaseClient
        .from("sponsorships")
        .insert({ ...payload, event_id: eventId ?? null, leaflet_id: leafletId ?? null })
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

  return {
    sponsorships,
    loading: demo ? false : isLoading,
    error: demo
      ? null
      : error
        ? error instanceof Error
          ? error.message
          : "Failed to load sponsorships"
        : null,
    refetch: async () => {
      if (!demo) await refetch();
    },
    createSponsorship: (args: {
      eventId?: string | null;
      leafletId?: string | null;
      payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">;
    }) => createMutation.mutateAsync(args),
    updateSponsorship: (id: string, patch: SponsorshipsUpdate) =>
      updateMutation.mutateAsync({ id, patch }),
  };
}
