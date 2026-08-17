"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Tasks, TasksInsert, TasksUpdate } from "@/types/database";

export function taskDueDate(distributionDate: string, offsetDays: number): Date {
  const d = new Date(`${distributionDate}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export type TaskContext = "leaflet" | "event";

type UseTasksOptions = {
  context: TaskContext;
  contextId: string | null;
  anchorDate: string | null;
};

export function useTasks(options: UseTasksOptions) {
  const { context, contextId, anchorDate } = options;
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks", context, contextId],
    queryFn: async () => {
      if (!supabaseClient || !contextId) return [];
      const { data, error: qError } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("context", context)
        .eq("context_id", contextId);
      if (qError) throw qError;
      const rows = (data ?? []) as Tasks[];
      if (!anchorDate) return rows;
      return [...rows].sort(
        (a, b) =>
          taskDueDate(anchorDate, a.offset_days).getTime() -
          taskDueDate(anchorDate, b.offset_days).getTime(),
      );
    },
    enabled: Boolean(contextId),
  });

  const openCount = tasks.filter((t) => !t.is_complete).length;

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TasksUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: uError } = await supabaseClient
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (uError) throw uError;
      return data as Tasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", context, contextId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<TasksInsert, "context" | "context_id">) => {
      if (!supabaseClient || !contextId) throw new Error("Supabase client is not initialized");
      const { data, error: iError } = await supabaseClient
        .from("tasks")
        .insert({
          ...payload,
          context,
          context_id: contextId,
        })
        .select()
        .single();
      if (iError) throw iError;
      return data as Tasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", context, contextId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: dError } = await supabaseClient.from("tasks").delete().eq("id", id);
      if (dError) throw dError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", context, contextId] });
    },
  });

  return {
    tasks,
    openCount,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load tasks") : null,
    refetch: async () => {
      await refetch();
    },
    toggleComplete: async (task: Tasks) => {
      const next = !task.is_complete;
      await updateMutation.mutateAsync({
        id: task.id,
        patch: {
          is_complete: next,
          completed_at: next ? new Date().toISOString() : null,
        },
      });
    },
    createTask: async (payload: { title: string; offset_days: number; description?: string | null }) => {
      return createMutation.mutateAsync(payload);
    },
    createTaskFull: async (payload: Omit<TasksInsert, "context" | "context_id">) => {
      return createMutation.mutateAsync(payload);
    },
    update: async (id: string, patch: TasksUpdate) => {
      return updateMutation.mutateAsync({ id, patch });
    },
    remove: async (id: string) => {
      await removeMutation.mutateAsync(id);
    },
  };
}
