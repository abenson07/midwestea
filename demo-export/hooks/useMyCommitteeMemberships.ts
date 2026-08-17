"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeSlug } from "schemas/committee_meetings";

export type MyCommitteeMembership = {
  id: string;
  committee: CommitteeSlug;
  title: "chair" | "co_chair" | "member";
};

export const MY_COMMITTEE_MEMBERSHIPS_KEY = ["my-committee-memberships"] as const;

type ApiMember = {
  id: string;
  committee: CommitteeSlug;
  title: "chair" | "co_chair" | "member";
};

async function fetchMyCommitteeMemberships(personId: string): Promise<MyCommitteeMembership[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-members?person_id=${encodeURIComponent(personId)}`,
  );
  const body = (await res.json()) as {
    error?: string;
    members?: ApiMember[];
    unavailable?: boolean;
  };
  if (body.unavailable) return [];
  if (!res.ok) throw new Error(body.error ?? "Failed to load committee memberships");
  return (body.members ?? []).map((row) => ({
    id: row.id,
    committee: row.committee,
    title: row.title,
  }));
}

/** Committees the given person belongs to, across all committees — for the account settings page. */
export function useMyCommitteeMemberships(personId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...MY_COMMITTEE_MEMBERSHIPS_KEY, personId],
    queryFn: () => fetchMyCommitteeMemberships(personId!),
    enabled: Boolean(personId),
  });

  const removeMembership = useCallback(
    async (id: string) => {
      const res = await fetch(`${getApiBase()}/api/committee-members/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to remove membership");
      await queryClient.invalidateQueries({ queryKey: MY_COMMITTEE_MEMBERSHIPS_KEY });
    },
    [queryClient],
  );

  const addMembership = useCallback(
    async (committee: CommitteeSlug) => {
      if (!personId) throw new Error("No current person");
      const res = await fetch(`${getApiBase()}/api/committee-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ committee, person_id: personId, title: "member" }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to join committee");
      await queryClient.invalidateQueries({ queryKey: MY_COMMITTEE_MEMBERSHIPS_KEY });
    },
    [personId, queryClient],
  );

  const updateMembershipTitle = useCallback(
    async (id: string, title: "chair" | "member") => {
      const res = await fetch(`${getApiBase()}/api/committee-members/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to update role");
      await queryClient.invalidateQueries({ queryKey: MY_COMMITTEE_MEMBERSHIPS_KEY });
    },
    [queryClient],
  );

  return {
    memberships: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    removeMembership,
    addMembership,
    updateMembershipTitle,
  };
}
