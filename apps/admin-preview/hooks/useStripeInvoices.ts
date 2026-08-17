"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleStripeInvoices } from "@/data/mocks/invoices";

export const STRIPE_INVOICES_QUERY_KEY = ["stripe-invoices"] as const;

async function fetchStripeInvoices(): Promise<StripeInvoiceTableRow[]> {
  const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
  const data = (await res.json()) as { invoices?: StripeInvoiceTableRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not load invoices.");
  return (data.invoices ?? []).map((row) => ({
    ...row,
    catalog_product_ids: row.catalog_product_ids ?? [],
    sponsorship_category: row.sponsorship_category ?? null,
    created_by_name: row.created_by_name ?? null,
  }));
}

export function useStripeInvoices() {
  const { enabled: demo } = useDemoModeOptional();
  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: STRIPE_INVOICES_QUERY_KEY,
    queryFn: fetchStripeInvoices,
    enabled: !demo,
  });

  return {
    invoices: demo ? sampleStripeInvoices : invoices,
    loading: demo ? false : isLoading,
    error: demo
      ? null
      : error
        ? error instanceof Error
          ? error.message
          : "Failed to load invoices"
        : null,
    refetch: async () => {
      if (!demo) await refetch();
    },
  };
}
