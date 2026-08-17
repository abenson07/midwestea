"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { Deliveries, DeliveriesUpdate, People, Routes } from "@/types/database";

export type DeliveryWithRelations = Deliveries & {
  routes?: Routes | null;
  people?: People | null;
};

export function useDeliveries(
  leafletId: string | null,
  options?: { openOnly?: boolean; skippedOnly?: boolean; enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const enabled = Boolean(leafletId) && (options?.enabled ?? true);

  const queryKey = [
    "deliveries",
    leafletId,
    options?.openOnly,
    options?.skippedOnly,
  ] as const;

  const { data: deliveries = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.openOnly) params.set("open", "true");
      if (options?.skippedOnly) params.set("skipped", "true");
      const qs = params.toString();
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${leafletId}/deliveries${qs ? `?${qs}` : ""}`,
      );
      const data = (await res.json()) as {
        error?: string;
        deliveries?: DeliveryWithRelations[];
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load deliveries");
      return data.deliveries ?? [];
    },
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      deliveryId,
      patch,
    }: {
      deliveryId: string;
      patch: DeliveriesUpdate;
    }) => {
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${deliveryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const data = (await res.json()) as { error?: string; delivery?: Deliveries };
      if (!res.ok) throw new Error(data.error ?? "Failed to update delivery");
      return data.delivery!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });

  return {
    deliveries,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load deliveries") : null,
    refetch: async () => {
      await refetch();
    },
    update: (deliveryId: string, patch: DeliveriesUpdate) =>
      updateMutation.mutateAsync({ deliveryId, patch }),
  };
}
