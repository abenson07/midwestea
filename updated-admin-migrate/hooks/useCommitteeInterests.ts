"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeInterests, CommitteeInterestStatus } from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { getSamplePendingInterests } from "@/data/mocks/committees";

export const COMMITTEE_INTERESTS_QUERY_KEY = ["committee_interests"] as const;

export function committeeInterestsQueryKey(params: {
  committee?: CommitteeSlug | null;
  status?: CommitteeInterestStatus | null;
  eventId?: string | null;
}) {
  return [
    ...COMMITTEE_INTERESTS_QUERY_KEY,
    params.committee ?? "all",
    params.status ?? "all",
    params.eventId ?? "all",
  ] as const;
}

async function fetchInterests(params: {
  committee?: CommitteeSlug | null;
  status?: CommitteeInterestStatus | null;
  eventId?: string | null;
}): Promise<CommitteeInterests[]> {
  const qs = new URLSearchParams();
  if (params.committee) qs.set("committee", params.committee);
  if (params.status) qs.set("status", params.status);
  if (params.eventId) qs.set("event_id", params.eventId);
  const res = await fetch(`${getApiBase()}/api/committee-interests?${qs.toString()}`);
  const body = (await res.json()) as { error?: string; interests?: CommitteeInterests[] };
  if (!res.ok) throw new Error(body.error ?? "Failed to load interests");
  return body.interests ?? [];
}

export function useCommitteeInterests(params: {
  committee?: CommitteeSlug | null;
  status?: CommitteeInterestStatus | null;
  eventId?: string | null;
  autoFetch?: boolean;
} = {}) {
  const { committee = null, status = null, eventId = null, autoFetch = true } = params;
  const { enabled: demo } = useDemoModeOptional();
  const queryClient = useQueryClient();

  const useDemoInterests = demo && Boolean(committee) && !eventId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: committeeInterestsQueryKey({ committee, status, eventId }),
    queryFn: () => fetchInterests({ committee, status, eventId }),
    enabled: autoFetch && !useDemoInterests,
  });

  const demoInterests = useMemo(() => {
    if (!useDemoInterests || !committee) return [] as CommitteeInterests[];
    const rows = getSamplePendingInterests(committee);
    if (status) return rows.filter((r) => r.status === status);
    return rows;
  }, [useDemoInterests, committee, status]);

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: COMMITTEE_INTERESTS_QUERY_KEY });
  }

  async function respondWithEmail(
    id: string,
    payload: { subject: string; text: string; html?: string },
  ) {
    const res = await fetch(
      `${getApiBase()}/api/committee-interests/${encodeURIComponent(id)}/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to send response");
    await invalidate();
  }

  async function markHandled(id: string, notes?: string) {
    const res = await fetch(
      `${getApiBase()}/api/committee-interests/${encodeURIComponent(id)}/mark-handled`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes ? { notes } : {}),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to mark handled");
    await invalidate();
  }

  return {
    interests: useDemoInterests ? demoInterests : (data ?? []),
    loading: useDemoInterests ? false : isLoading,
    error: useDemoInterests
      ? null
      : error
        ? error instanceof Error
          ? error.message
          : String(error)
        : null,
    refetch: async () => {
      if (!useDemoInterests) await refetch();
    },
    respondWithEmail,
    markHandled,
  };
}
