"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { EventTemplates } from "@/types/database";

export const EVENT_TEMPLATES_QUERY_KEY = ["event_templates"] as const;

export function useEventTemplates({ autoFetch = true } = {}) {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: EVENT_TEMPLATES_QUERY_KEY,
    queryFn: async () => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: rows, error: qError } = await supabaseClient
        .from("event_templates")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (qError) throw qError;
      return (rows ?? []) as EventTemplates[];
    },
    enabled: autoFetch,
  });

  return {
    templates: data,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
