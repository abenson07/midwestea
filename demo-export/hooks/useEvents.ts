"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import { getApiBase } from "@/lib/apiBase";
import {
  mapEventEdition,
  mapEventListItem,
  type EventEdition,
  type EventListItem,
} from "@/lib/events/eventData";
import type { Events, EventsUpdate } from "@/types/database";

export const EVENTS_QUERY_KEY = ["events"] as const;

const EVENTS_SELECT =
  "id, name, starts_at, ends_at, field_data, event_template_id, slug, date, committee, publish_status, created_at, updated_at";

async function fetchEventsRows(): Promise<Events[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }
  const { data, error } = await supabaseClient
    .from("events")
    .select(EVENTS_SELECT)
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
  return (data as Events[]) ?? [];
}

async function fetchEventRow(eventId: string): Promise<Events | null> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }
  const { data, error } = await supabaseClient
    .from("events")
    .select(EVENTS_SELECT)
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`);
  }
  return (data as Events | null) ?? null;
}

export type CreateEventPayload = {
  name: string;
  starts_at: string;
  ends_at?: string | null;
  event_template_id?: string | null;
  committee?: string | null;
  field_data?: Record<string, unknown>;
};

export function useEvents({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEventsRows,
    enabled: autoFetch,
  });

  const events: EventListItem[] = (data ?? []).map(mapEventListItem);

  const createMutation = useMutation({
    mutationFn: async (input: CreateEventPayload) => {
      const res = await fetch(`${getApiBase()}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await res.json()) as { error?: string; event?: Events };
      if (!res.ok) throw new Error(body.error ?? "Failed to create event");
      return body.event!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: EventsUpdate }) => {
      const res = await fetch(`${getApiBase()}/api/events/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json()) as { error?: string; event?: Events };
      if (!res.ok) throw new Error(body.error ?? "Failed to update event");
      return body.event!;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EVENTS_QUERY_KEY, event.id] });
    },
  });

  return {
    events,
    eventRows: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    create: (input: CreateEventPayload) => createMutation.mutateAsync(input),
    update: (id: string, patch: EventsUpdate) =>
      updateMutation.mutateAsync({ id, patch }),
  };
}

export function useEvent(eventId: string | null, { autoFetch = true } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...EVENTS_QUERY_KEY, eventId],
    queryFn: () => fetchEventRow(eventId!),
    enabled: autoFetch && Boolean(eventId),
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: EventsUpdate) => {
      if (!eventId) throw new Error("No event selected");
      const res = await fetch(`${getApiBase()}/api/events/${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await res.json()) as { error?: string; event?: Events };
      if (!res.ok) throw new Error(body.error ?? "Failed to update event");
      return body.event!;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EVENTS_QUERY_KEY, event.id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error("No event selected");

      const res = await fetch(`${getApiBase()}/api/events/${encodeURIComponent(eventId)}/publish`, {
        method: "POST",
      });

      const body = (await res.json()) as { error?: string; event?: Events };
      if (!res.ok) throw new Error(body.error ?? "Failed to publish event");
      return body.event!;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EVENTS_QUERY_KEY, event.id] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error("No event selected");

      const res = await fetch(`${getApiBase()}/api/events/${encodeURIComponent(eventId)}/unpublish`, {
        method: "POST",
      });

      const body = (await res.json()) as { error?: string; event?: Events };
      if (!res.ok) throw new Error(body.error ?? "Failed to unpublish event");
      return body.event!;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EVENTS_QUERY_KEY, event.id] });
    },
  });

  const event: EventEdition | null = data ? mapEventEdition(data) : null;

  const uploadCoverImage = async (file: File): Promise<string> => {
    if (!supabaseClient) throw new Error("Supabase client is not initialized");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("event-images")
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabaseClient.storage
      .from("event-images")
      .getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  return {
    event,
    eventRow: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    update: (patch: EventsUpdate) => updateMutation.mutateAsync(patch),
    publish: () => publishMutation.mutateAsync(),
    unpublish: () => unpublishMutation.mutateAsync(),
    uploadCoverImage,
  };
}
