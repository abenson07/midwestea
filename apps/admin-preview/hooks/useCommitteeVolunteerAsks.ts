"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Events, People, VolunteerAsks, Volunteers } from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type { VolunteerAskWithSignups, VolunteerSignup } from "./useVolunteerAsks";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import type { SampleVolunteerAsk } from "@/data/mocks/committees";
import {
  DEMO_VOLUNTEER_ASKS_EVENT,
  listDemoVolunteerAsks,
} from "@/lib/demo/demoVolunteerAsks";

export const committeeVolunteerAsksQueryKey = (committee: CommitteeSlug | null) =>
  ["volunteer_asks", "committee", committee] as const;

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

export function mapSampleVolunteerAsk(ask: SampleVolunteerAsk): VolunteerAskWithSignups {
  const now = new Date().toISOString();
  return {
    id: ask.id,
    title: ask.title,
    description: ask.description,
    commitment_type: "one_off",
    commitment_unit: "hours",
    commitment_quantity: 1,
    quantity: ask.quantity,
    event_id: null,
    committee: ask.committee,
    auto_accept: false,
    auto_response_body: null,
    created_at: now,
    updated_at: now,
    event: null,
    signups: [],
    signup_count: 0,
    remaining_slots: ask.quantity,
  };
}

export function useCommitteeVolunteerAsks(committee: CommitteeSlug | null) {
  const { enabled: demo } = useDemoModeOptional();
  const useDemoAsks = demo && Boolean(committee);

  const [demoTick, setDemoTick] = useState(0);
  useEffect(() => {
    if (!useDemoAsks) return;
    const onChange = () => setDemoTick((n) => n + 1);
    window.addEventListener(DEMO_VOLUNTEER_ASKS_EVENT, onChange);
    return () => window.removeEventListener(DEMO_VOLUNTEER_ASKS_EVENT, onChange);
  }, [useDemoAsks]);

  const demoAsks = useMemo(() => {
    if (!useDemoAsks || !committee) return [] as VolunteerAskWithSignups[];
    void demoTick;
    return listDemoVolunteerAsks(committee).map(mapSampleVolunteerAsk);
  }, [useDemoAsks, committee, demoTick]);

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: committeeVolunteerAsksQueryKey(committee),
    queryFn: async () => {
      if (!supabaseClient || !committee) return [];
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
        .eq("committee", committee)
        .order("created_at", { ascending: false });

      if (qError) throw qError;
      return (rows as AskRow[] | null)?.map(transformAsk) ?? [];
    },
    enabled: Boolean(committee) && !useDemoAsks,
  });

  const asks = useDemoAsks ? demoAsks : data;
  const openAsks = asks.filter((a) => a.remaining_slots > 0);
  const filledAsks = asks.filter((a) => a.remaining_slots <= 0);

  const refetchDemo = useCallback(async () => {
    setDemoTick((n) => n + 1);
  }, []);

  return {
    asks,
    openAsks,
    filledAsks,
    loading: useDemoAsks ? false : isLoading,
    error: useDemoAsks
      ? null
      : error
        ? error instanceof Error
          ? error.message
          : String(error)
        : null,
    refetch: async () => {
      if (useDemoAsks) await refetchDemo();
      else await refetch();
    },
  };
}
