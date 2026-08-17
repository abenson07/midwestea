"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type { People } from "@/types/database";

export const committeeDefaultAttendeesKey = (committee: CommitteeSlug) =>
  ["committee-default-attendees", committee] as const;

export type CommitteeDefaultAttendee = {
  id: string;
  person_id: string;
  person: Pick<People, "id" | "full_name" | "email"> | null;
};

async function fetchDefaultAttendees(committee: CommitteeSlug): Promise<CommitteeDefaultAttendee[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-meetings/settings/default-attendees?committee=${encodeURIComponent(committee)}`,
  );
  const body = (await res.json()) as { error?: string; attendees?: CommitteeDefaultAttendee[] };
  if (!res.ok) throw new Error(body.error ?? "Failed to load default attendees");
  return body.attendees ?? [];
}

export function useCommitteeDefaultAttendees(
  committee: CommitteeSlug,
  { autoFetch = true } = {},
) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: committeeDefaultAttendeesKey(committee),
    queryFn: () => fetchDefaultAttendees(committee),
    enabled: autoFetch && Boolean(committee),
  });

  async function save(personIds: string[]) {
    const res = await fetch(`${getApiBase()}/api/committee-meetings/settings/default-attendees`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ committee, person_ids: personIds }),
    });
    const body = (await res.json()) as { error?: string; attendees?: CommitteeDefaultAttendee[] };
    if (!res.ok) throw new Error(body.error ?? "Failed to save");
    await queryClient.invalidateQueries({ queryKey: committeeDefaultAttendeesKey(committee) });
    return body.attendees ?? [];
  }

  return {
    attendees: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    save,
  };
}
