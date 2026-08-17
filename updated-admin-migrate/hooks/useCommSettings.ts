"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { CommSettings } from "@/types/database";

/** Canonical pipeline order for leaflet comm steps (do not rely on created_at). */
export const LEAFLET_COMM_STEP_ORDER = [
  "initial_confirmation",
  "pre_distribution_reminder",
  "distribution_day_pickup",
  "delivery_complete_prompt",
  "completion_followup",
] as const;

export function sortLeafletCommSettings(settings: CommSettings[]): CommSettings[] {
  const order = new Map(LEAFLET_COMM_STEP_ORDER.map((key, index) => [key, index]));
  return [...settings].sort((a, b) => {
    const ai = order.get(a.step_key as (typeof LEAFLET_COMM_STEP_ORDER)[number]) ?? 999;
    const bi = order.get(b.step_key as (typeof LEAFLET_COMM_STEP_ORDER)[number]) ?? 999;
    return ai - bi;
  });
}

export function useCommSettings(context: "leaflet" | "event" | "membership" = "leaflet") {
  const { data: settings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["comm_settings", context],
    queryFn: async () => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: qError } = await supabaseClient
        .from("comm_settings")
        .select("*")
        .eq("context", context)
        .is("event_template_id", null)
        .order("created_at", { ascending: true });
      if (qError) throw qError;
      const rows = (data ?? []) as CommSettings[];
      return context === "leaflet" ? sortLeafletCommSettings(rows) : rows;
    },
  });

  return {
    settings,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load comm settings") : null,
    refetch: async () => {
      await refetch();
    },
  };
}
