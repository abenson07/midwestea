"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { ActionItemStatus } from "@/types/database";

export const MY_ACTION_ITEMS_QUERY_KEY = ["action-items", "mine"] as const;
export const ALL_ACTION_ITEMS_QUERY_KEY = ["action-items", "all"] as const;

export type MyActionItem = {
  id: string;
  title: string;
  description: string | null;
  status: ActionItemStatus;
  due_at: string | null;
  sort_order: number;
  committee_meeting_id: string | null;
  committee_meetings: {
    id: string;
    committee: string;
    event_id: string;
    events: { name: string; starts_at: string | null } | null;
  } | null;
};

async function fetchMyActionItems(): Promise<{ items: MyActionItem[]; openCount: number }> {
  const res = await fetch(`${getApiBase()}/api/action-items/mine`);
  const body = (await res.json()) as {
    error?: string;
    action_items?: MyActionItem[];
    open_count?: number;
  };
  if (!res.ok) throw new Error(body.error ?? "Failed to load action items");
  return {
    items: body.action_items ?? [],
    openCount: body.open_count ?? 0,
  };
}

export function useMyActionItems({ autoFetch = true } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: MY_ACTION_ITEMS_QUERY_KEY,
    queryFn: fetchMyActionItems,
    enabled: autoFetch,
  });

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
    await queryClient.invalidateQueries({ queryKey: MY_ACTION_ITEMS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: ALL_ACTION_ITEMS_QUERY_KEY });
  }

  async function markDone(id: string) {
    await updateActionItem(id, { status: "done" });
  }

  async function reassign(id: string, assigneePersonId: string | null) {
    await updateActionItem(id, { assignee_person_id: assigneePersonId });
  }

  return {
    items: data?.items ?? [],
    openCount: data?.openCount ?? 0,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    markDone,
    reassign,
    updateActionItem,
  };
}

export function useActionItemsForMeeting(meetingId: string | null) {
  const { items, updateActionItem, refetch } = useMyActionItems({ autoFetch: false });

  async function patchMeetingActionItem(
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
    await refetch();
  }

  return { items, meetingId, patchMeetingActionItem, updateActionItem };
}
