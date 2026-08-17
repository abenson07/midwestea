"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import { supabaseClient } from "@/lib/supabaseClient";
import type { DeliveryWithRelations } from "hooks";
import type { Leaflets } from "@/types/database";

export function useLeafletHistory(
  leaflet: Leaflets | null,
  leaflets: Leaflets[],
  enabled: boolean,
) {
  const previousLeaflet = leaflet
    ? leaflets
        .filter(
          (l) =>
            l.status === "closed" &&
            l.distribution_date < leaflet.distribution_date,
        )
        .sort((a, b) => b.distribution_date.localeCompare(a.distribution_date))[0] ??
      null
    : null;

  const closedIds = leaflets.filter((l) => l.status === "closed").map((l) => l.id);

  const previousQuery = useQuery({
    queryKey: ["deliveries", previousLeaflet?.id, "prev"],
    queryFn: async () => {
      if (!previousLeaflet) return [] as DeliveryWithRelations[];
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${previousLeaflet.id}/deliveries`,
      );
      const data = (await res.json()) as { deliveries?: DeliveryWithRelations[] };
      return data.deliveries ?? [];
    },
    enabled: enabled && Boolean(previousLeaflet),
  });

  const historyQuery = useQuery({
    queryKey: ["leaflet-delivery-history", closedIds.join(",")],
    queryFn: async () => {
      if (!supabaseClient || closedIds.length === 0) return [] as DeliveryWithRelations[];
      const { data, error } = await supabaseClient
        .from("deliveries")
        .select(
          `
          *,
          routes (*),
          people!deliveries_person_id_fkey (*)
        `,
        )
        .in("leaflet_id", closedIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DeliveryWithRelations[];
    },
    enabled: enabled && closedIds.length > 0,
  });

  return {
    previousDeliveries: previousQuery.data ?? [],
    historyDeliveries: historyQuery.data ?? [],
    loading: previousQuery.isLoading || historyQuery.isLoading,
  };
}
