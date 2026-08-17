"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "@/lib/apiBase";

export type ShirtPreorderItemRow = {
  id: string;
  person_id: string;
  product_slug: string;
  product_name: string;
  variant: string;
  unit_amount_cents: number;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  people: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
};

export const SHIRT_UNIT_CENTS = 2000;

export type PersonOrderRow = {
  personId: string;
  fullName: string;
  email: string;
  phone: string;
  sizesSummary: string;
  quantity: number;
  paymentStatus: string;
  latestAt: string;
};

function summarizeStatus(statuses: string[]): string {
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0]!;
  if (unique.includes("paid") && unique.includes("pending")) return "mixed";
  return unique.join(", ");
}

function summarizeSizes(variants: string[]): string {
  const counts = new Map<string, number>();
  for (const v of variants) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([variant, count]) => `${count}× ${variant}`)
    .join(", ");
}

export function groupShirtItemsByPerson(items: ShirtPreorderItemRow[]): PersonOrderRow[] {
  const byPerson = new Map<
    string,
    {
      personId: string;
      fullName: string;
      email: string;
      phone: string;
      variants: string[];
      statuses: string[];
      latestAt: string;
    }
  >();

  for (const item of items) {
    const personId = item.person_id;
    const existing = byPerson.get(personId);
    const fullName = item.people?.full_name?.trim() || "Unknown";
    const email = item.people?.email?.trim() || "—";
    const phone = item.people?.phone?.trim() || "—";

    if (!existing) {
      byPerson.set(personId, {
        personId,
        fullName,
        email,
        phone,
        variants: [item.variant],
        statuses: [item.status],
        latestAt: item.created_at,
      });
      continue;
    }

    existing.variants.push(item.variant);
    existing.statuses.push(item.status);
    if (item.created_at > existing.latestAt) existing.latestAt = item.created_at;
  }

  return [...byPerson.values()]
    .map((row) => ({
      personId: row.personId,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      sizesSummary: summarizeSizes(row.variants),
      quantity: row.variants.length,
      paymentStatus: summarizeStatus(row.statuses),
      latestAt: row.latestAt,
    }))
    .sort((a, b) => b.latestAt.localeCompare(a.latestAt));
}

export function sizeCountsFromItems(items: ShirtPreorderItemRow[]): { size: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.variant, (counts.get(item.variant) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => a.size.localeCompare(b.size));
}

export function useShirtPreorderItems() {
  const [items, setItems] = useState<ShirtPreorderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/commerce/shirt-preorders`);
        const json = (await res.json()) as {
          items?: ShirtPreorderItemRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        if (!cancelled) setItems(json.items ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const personOrders = useMemo(() => groupShirtItemsByPerson(items), [items]);
  const sizeCounts = useMemo(() => sizeCountsFromItems(items), [items]);
  const totalOrdered = items.length;
  const totalRevenueCents = totalOrdered * SHIRT_UNIT_CENTS;

  return {
    items,
    personOrders,
    sizeCounts,
    totalOrdered,
    totalRevenueCents,
    loading,
    error,
  };
}
