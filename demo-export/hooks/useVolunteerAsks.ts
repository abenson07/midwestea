"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  VolunteerAsks,
  VolunteerAsksInsert,
  VolunteerAsksUpdate,
  Volunteers,
  VolunteersInsert,
  Events,
  People,
} from "@/types/database";

export const VOLUNTEER_ASKS_QUERY_KEY = ["volunteer_asks"] as const;

export interface VolunteerSignup extends Volunteers {
  person?: People | null;
}

export interface VolunteerAskWithSignups extends VolunteerAsks {
  event?: Events | null;
  signups: VolunteerSignup[];
  signup_count: number;
  remaining_slots: number;
}

interface UseVolunteerAsksOptions {
  autoFetch?: boolean;
}

interface UseVolunteerAsksReturn {
  asks: VolunteerAskWithSignups[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAsk: (data: VolunteerAsksInsert) => Promise<VolunteerAsks>;
  updateAsk: (id: string, data: VolunteerAsksUpdate) => Promise<VolunteerAsks | null>;
  deleteAsk: (id: string) => Promise<boolean>;
  addSignup: (data: VolunteersInsert) => Promise<Volunteers | null>;
  removeSignup: (id: string) => Promise<boolean>;
}

type AskRow = VolunteerAsks & {
  event: Events | Events[] | null;
  volunteers: (Volunteers & { person: People | People[] | null })[];
};

function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function transformAsk(row: AskRow): VolunteerAskWithSignups {
  const { volunteers: volunteerRows, event: eventRaw, ...ask } = row;
  const event = normalizeOne(eventRaw);
  const signups: VolunteerSignup[] = (volunteerRows ?? []).map((v) => ({
    id: v.id,
    volunteer_ask_id: v.volunteer_ask_id,
    person_id: v.person_id,
    status: v.status ?? "accepted",
    accepted_at: v.accepted_at ?? null,
    accepted_by: v.accepted_by ?? null,
    created_at: v.created_at,
    person: normalizeOne(v.person),
  }));
  const signup_count = signups.length;
  return {
    ...ask,
    event,
    signups,
    signup_count,
    remaining_slots: Math.max(0, ask.quantity - signup_count),
  };
}

async function fetchVolunteerAsksData(): Promise<VolunteerAskWithSignups[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }

  const { data, error } = await supabaseClient
    .from("volunteer_asks")
    .select(
      `
      *,
      event:events(*),
      volunteers(
        id,
        volunteer_ask_id,
        person_id,
        status,
        accepted_at,
        accepted_by,
        created_at,
        person:people(id, full_name, email, phone)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch volunteer asks: ${error.message}`);
  }

  return (data as AskRow[] | null)?.map(transformAsk) ?? [];
}

export function useVolunteerAsks({
  autoFetch = true,
}: UseVolunteerAsksOptions = {}): UseVolunteerAsksReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: VOLUNTEER_ASKS_QUERY_KEY,
    queryFn: fetchVolunteerAsksData,
    enabled: autoFetch,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["volunteer_asks"] });
  };

  const createAskMutation = useMutation({
    mutationFn: async (payload: VolunteerAsksInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized.");
      const { data: created, error: insertError } = await supabaseClient
        .from("volunteer_asks")
        .insert(payload)
        .select()
        .single();
      if (insertError) throw insertError;
      return created as VolunteerAsks;
    },
    onSuccess: () => void invalidate(),
  });

  const updateAskMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VolunteerAsksUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized.");
      const { data: updated, error: updateError } = await supabaseClient
        .from("volunteer_asks")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updated as VolunteerAsks;
    },
    onSuccess: () => void invalidate(),
  });

  const deleteAskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized.");
      const { error: deleteError } = await supabaseClient
        .from("volunteer_asks")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      return true;
    },
    onSuccess: () => void invalidate(),
  });

  const addSignupMutation = useMutation({
    mutationFn: async (payload: VolunteersInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized.");
      const { data: created, error: insertError } = await supabaseClient
        .from("volunteers")
        .insert(payload)
        .select()
        .single();
      if (insertError) throw insertError;
      return created as Volunteers;
    },
    onSuccess: () => void invalidate(),
  });

  const removeSignupMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized.");
      const { error: deleteError } = await supabaseClient.from("volunteers").delete().eq("id", id);
      if (deleteError) throw deleteError;
      return true;
    },
    onSuccess: () => void invalidate(),
  });

  return {
    asks: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await invalidate();
    },
    createAsk: (payload) => createAskMutation.mutateAsync(payload),
    updateAsk: (id, payload) =>
      updateAskMutation.mutateAsync({ id, payload }).catch(() => null),
    deleteAsk: (id) => deleteAskMutation.mutateAsync(id).catch(() => false),
    addSignup: (payload) => addSignupMutation.mutateAsync(payload).catch(() => null),
    removeSignup: (id) => removeSignupMutation.mutateAsync(id).catch(() => false),
  };
}
