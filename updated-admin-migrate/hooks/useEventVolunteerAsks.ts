"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  Events,
  People,
  VolunteerAsks,
  Volunteers,
} from "@/types/database";
import type { VolunteerAskWithSignups, VolunteerSignup } from "./useVolunteerAsks";

export const eventVolunteerAsksQueryKey = (eventId: string | null) =>
  ["volunteer_asks", "event", eventId] as const;

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

export function useEventVolunteerAsks(eventId: string | null) {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: eventVolunteerAsksQueryKey(eventId),
    queryFn: async () => {
      if (!supabaseClient || !eventId) return [];
      const { data: rows, error: qError } = await supabaseClient
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
        `,
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (qError) throw qError;
      return (rows as AskRow[] | null)?.map(transformAsk) ?? [];
    },
    enabled: Boolean(eventId),
  });

  const volunteerSignupTotal = data.reduce((sum, ask) => sum + ask.signup_count, 0);

  return {
    asks: data,
    volunteerSignupTotal,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
