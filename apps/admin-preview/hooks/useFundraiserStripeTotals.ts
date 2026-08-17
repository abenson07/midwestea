"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { FundraiserStripeTotals } from "@/lib/commerce/getFundraiserStripeTotals";

export const FUNDRAISER_STRIPE_TOTALS_QUERY_KEY = "fundraiser-stripe-totals";

async function fetchFundraiserStripeTotals(): Promise<FundraiserStripeTotals> {
  const response = await fetch(
    `${getApiBase()}/api/commerce/fundraiser-stripe-totals`
  );
  const json = (await response.json()) as FundraiserStripeTotals & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(json.error ?? "Failed to load fundraiser Stripe totals");
  }
  return json;
}

export function useFundraiserStripeTotals(options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: [FUNDRAISER_STRIPE_TOTALS_QUERY_KEY],
    queryFn: fetchFundraiserStripeTotals,
    enabled,
    staleTime: 60_000,
  });

  return {
    totals: data ?? null,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load fundraiser Stripe totals"
      : null,
    refetch: async () => {
      await refetch();
    },
    queriedAt: data?.queriedAt ?? (dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null),
  };
}
