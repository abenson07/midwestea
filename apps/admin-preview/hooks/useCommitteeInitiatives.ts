"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type {
  CommitteeInitiative,
  CommitteeInitiativeTask,
} from "@/data/mocks/committees";
import type { ActionItemStatus } from "@/types/database";

export const COMMITTEE_INITIATIVES_KEY = ["committee-initiatives"] as const;

function committeeInitiativesKey(committee: CommitteeSlug | null) {
  return [...COMMITTEE_INITIATIVES_KEY, committee] as const;
}

function initiativeKey(id: string | null) {
  return [...COMMITTEE_INITIATIVES_KEY, "detail", id] as const;
}

type ApiInitiative = {
  id: string;
  committee: CommitteeSlug;
  title: string;
  description: string | null;
  tasks?: Array<{
    id: string;
    title: string;
    status: ActionItemStatus;
    due_at: string | null;
    assignee_person_id: string | null;
    assignee?: { id: string; full_name: string } | null;
  }>;
};

function mapTask(row: NonNullable<ApiInitiative["tasks"]>[number]): CommitteeInitiativeTask {
  return {
    id: row.id,
    title: row.title,
    status: row.status === "canceled" ? "canceled" : row.status === "done" ? "done" : "open",
    dueAt: row.due_at,
    assigneeId: row.assignee_person_id ?? row.assignee?.id ?? null,
    assigneeName: row.assignee?.full_name ?? null,
  };
}

function mapInitiative(row: ApiInitiative): CommitteeInitiative {
  return {
    id: row.id,
    committee: row.committee,
    title: row.title,
    description: row.description ?? "",
    tasks: (row.tasks ?? []).map(mapTask),
  };
}

async function fetchInitiatives(committee: CommitteeSlug): Promise<CommitteeInitiative[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-initiatives?committee=${encodeURIComponent(committee)}`,
  );
  const body = (await res.json()) as {
    error?: string;
    initiatives?: ApiInitiative[];
    unavailable?: boolean;
  };
  if (res.status === 404 || body.unavailable) return [];
  if (!res.ok) throw new Error(body.error ?? "Failed to load initiatives");
  return (body.initiatives ?? []).map(mapInitiative);
}

async function fetchInitiative(id: string): Promise<CommitteeInitiative | null> {
  const res = await fetch(`${getApiBase()}/api/committee-initiatives/${encodeURIComponent(id)}`);
  const body = (await res.json()) as {
    error?: string;
    initiative?: ApiInitiative;
    unavailable?: boolean;
  };
  if (res.status === 404) return null;
  if (body.unavailable) return null;
  if (!res.ok) throw new Error(body.error ?? "Failed to load initiative");
  return body.initiative ? mapInitiative(body.initiative) : null;
}

export function useCommitteeInitiatives(committee: CommitteeSlug | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: committeeInitiativesKey(committee),
    queryFn: () => fetchInitiatives(committee!),
    enabled: Boolean(committee),
  });

  const createInitiative = useCallback(
    async (input: { title: string; description?: string | null }) => {
      if (!committee) throw new Error("No committee");
      const res = await fetch(`${getApiBase()}/api/committee-initiatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          committee,
          title: input.title,
          description: input.description ?? null,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        initiative?: ApiInitiative;
      };
      if (!res.ok) throw new Error(body.error ?? "Failed to create initiative");
      if (!body.initiative) throw new Error("No initiative returned");
      await queryClient.invalidateQueries({ queryKey: COMMITTEE_INITIATIVES_KEY });
      return mapInitiative(body.initiative);
    },
    [committee, queryClient],
  );

  return {
    initiatives: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    createInitiative,
  };
}

export function useCommitteeInitiative(initiativeId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: initiativeKey(initiativeId),
    queryFn: () => fetchInitiative(initiativeId!),
    enabled: Boolean(initiativeId),
  });

  const replaceLocalTasks = useCallback(
    (tasks: CommitteeInitiativeTask[]) => {
      if (!initiativeId) return;
      queryClient.setQueryData(initiativeKey(initiativeId), (prev: CommitteeInitiative | null | undefined) =>
        prev ? { ...prev, tasks } : prev,
      );
    },
    [initiativeId, queryClient],
  );

  const replaceLocalMeta = useCallback(
    (patch: { title?: string; description?: string }) => {
      if (!initiativeId) return;
      queryClient.setQueryData(initiativeKey(initiativeId), (prev: CommitteeInitiative | null | undefined) =>
        prev ? { ...prev, ...patch } : prev,
      );
    },
    [initiativeId, queryClient],
  );

  const updateInitiative = useCallback(
    async (patch: { title?: string; description?: string }) => {
      if (!initiativeId) throw new Error("No initiative");
      const res = await fetch(
        `${getApiBase()}/api/committee-initiatives/${encodeURIComponent(initiativeId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to update initiative");
      replaceLocalMeta(patch);
      await queryClient.invalidateQueries({ queryKey: COMMITTEE_INITIATIVES_KEY });
    },
    [initiativeId, queryClient, replaceLocalMeta],
  );

  const createTask = useCallback(
    async (input: {
      title: string;
      assignee_person_id?: string | null;
      due_at?: string | null;
    }) => {
      if (!initiativeId) throw new Error("No initiative");
      const res = await fetch(`${getApiBase()}/api/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          assignee_person_id: input.assignee_person_id ?? null,
          due_at: input.due_at ?? null,
          initiative_id: initiativeId,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to create task");
      await queryClient.invalidateQueries({ queryKey: initiativeKey(initiativeId) });
      await queryClient.invalidateQueries({ queryKey: COMMITTEE_INITIATIVES_KEY });
    },
    [initiativeId, queryClient],
  );

  const updateTask = useCallback(
    async (
      id: string,
      patch: {
        title?: string;
        assignee_person_id?: string | null;
        due_at?: string | null;
        status?: ActionItemStatus;
      },
    ) => {
      const res = await fetch(`${getApiBase()}/api/action-items/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to update task");
      if (initiativeId) {
        await queryClient.invalidateQueries({ queryKey: initiativeKey(initiativeId) });
      }
    },
    [initiativeId, queryClient],
  );

  return {
    initiative: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    createTask,
    updateTask,
    updateInitiative,
    replaceLocalTasks,
    replaceLocalMeta,
  };
}
