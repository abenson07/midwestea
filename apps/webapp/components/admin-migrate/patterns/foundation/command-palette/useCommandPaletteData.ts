"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import type { StagingStudent } from "@/lib/admin-migrate/students";
import type { StagingClass } from "@/lib/admin-migrate/classes";
import type { AdminTransaction } from "@/app/api/admin/transactions/route";

const STALE_TIME_MS = 5 * 60 * 1000;

async function fetchWithAuth<T>(path: string): Promise<T> {
  const { session } = await getSession();
  if (!session) throw new Error("Not authenticated");
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error(`Request to ${path} failed (${response.status})`);
  return response.json();
}

/**
 * Only ever mounted (via `<CommandPalette>`) once the palette has been
 * opened, so mounting itself is the "don't fetch until needed" gate — no
 * separate `enabled` flag required. `QueryProvider`'s defaults
 * (`refetchOnMount: false`, multi-hour `gcTime`) mean closing and
 * reopening the palette reuses the cached lists instead of refetching.
 */
export function useCommandPaletteData() {
  const studentsQuery = useQuery({
    queryKey: ["command-palette", "students"],
    queryFn: async () =>
      (await fetchWithAuth<{ students: StagingStudent[] }>("/api/admin/students")).students,
    staleTime: STALE_TIME_MS,
  });

  const classesQuery = useQuery({
    queryKey: ["command-palette", "classes"],
    queryFn: async () =>
      (await fetchWithAuth<{ classes: StagingClass[] }>("/api/admin/classes")).classes,
    staleTime: STALE_TIME_MS,
  });

  const transactionsQuery = useQuery({
    queryKey: ["command-palette", "transactions"],
    queryFn: async () =>
      (await fetchWithAuth<{ transactions: AdminTransaction[] }>("/api/admin/transactions"))
        .transactions,
    staleTime: STALE_TIME_MS,
  });

  return {
    students: studentsQuery.data ?? [],
    classes: classesQuery.data ?? [],
    transactions: transactionsQuery.data ?? [],
    isLoading: studentsQuery.isLoading || classesQuery.isLoading || transactionsQuery.isLoading,
  };
}
