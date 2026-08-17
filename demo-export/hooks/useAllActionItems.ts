"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import {
  groupActionItemsByMeeting,
  type ActionItemListRow,
} from "@/lib/committee-meetings/actionItemsPage";
import type { ActionItemStatus } from "@/types/database";
import { ALL_ACTION_ITEMS_QUERY_KEY, MY_ACTION_ITEMS_QUERY_KEY } from "./useActionItems";

async function fetchAllActionItems(): Promise<{
  items: ActionItemListRow[];
  openCount: number;
}> {
  const res = await fetch(`${getApiBase()}/api/action-items`);
  const body = (await res.json()) as {
    error?: string;
    action_items?: ActionItemListRow[];
    open_count?: number;
  };
  if (!res.ok) throw new Error(body.error ?? "Failed to load action items");
  return {
    items: body.action_items ?? [],
    openCount: body.open_count ?? 0,
  };
}

export function useAllActionItems({ autoFetch = true } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ALL_ACTION_ITEMS_QUERY_KEY,
    queryFn: fetchAllActionItems,
    enabled: autoFetch,
  });

  const groups = useMemo(
    () => groupActionItemsByMeeting(data?.items ?? []),
    [data?.items],
  );

  const openCount = data?.openCount ?? 0;

  async function updateActionItem(
    id: string,
    patch: {
      status?: ActionItemStatus;
      assignee_person_id?: string | null;
    },
  ) {
    const res = await fetch(`${getApiBase()}/api/action-items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update action item");
    await queryClient.invalidateQueries({ queryKey: ALL_ACTION_ITEMS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: MY_ACTION_ITEMS_QUERY_KEY });
  }

  async function toggleDone(id: string, done: boolean) {
    await updateActionItem(id, { status: done ? "done" : "open" });
  }

  return {
    items: data?.items ?? [],
    groups,
    openCount,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    toggleDone,
    updateActionItem,
  };
}
