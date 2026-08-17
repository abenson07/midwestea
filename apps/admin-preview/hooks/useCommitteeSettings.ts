"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type {
  CommitteeDetail,
  CommitteeMemberRow,
  CommitteeMemberTitle,
} from "@/data/mocks/committees";

export const COMMITTEE_PROFILE_KEY = ["committee-profile"] as const;
export const COMMITTEE_MEMBERS_KEY = ["committee-members"] as const;

type ApiProfile = {
  committee: CommitteeSlug;
  name: string;
  description: string | null;
  cadence: string | null;
  meeting_day: string | null;
  location: string | null;
  website_slug: string | null;
  publish_status: "draft" | "published";
};

type ApiMember = {
  id: string;
  person_id: string;
  title: "chair" | "co_chair" | "member";
  person: { id: string; full_name: string; email: string | null } | null;
};

function titleToUi(title: ApiMember["title"]): CommitteeMemberTitle {
  // co_chair from older rows maps to Chair; Co-Chair is derived in the UI.
  if (title === "chair" || title === "co_chair") return "Chair";
  return "Member";
}

function titleToApi(title: CommitteeMemberTitle): "chair" | "member" {
  return title === "Chair" ? "chair" : "member";
}

function mapMember(row: ApiMember): CommitteeMemberRow {
  return {
    id: row.id,
    personId: row.person_id,
    name: row.person?.full_name ?? "Unknown",
    email: row.person?.email ?? "",
    role: titleToUi(row.title),
  };
}

export function mapProfileToDetail(
  profile: ApiProfile | null,
  fallback: CommitteeDetail,
): CommitteeDetail {
  if (!profile) return fallback;
  return {
    ...fallback,
    name: profile.name || fallback.name,
    description: profile.description ?? fallback.description,
    cadence: profile.cadence ?? fallback.cadence,
    meetingDay: profile.meeting_day ?? fallback.meetingDay,
    location: profile.location ?? fallback.location,
    websiteSlug: profile.website_slug ?? fallback.websiteSlug,
    publishStatus: profile.publish_status,
  };
}

async function fetchProfile(committee: CommitteeSlug): Promise<ApiProfile | null> {
  const res = await fetch(
    `${getApiBase()}/api/committee-profiles?committee=${encodeURIComponent(committee)}`,
  );
  const body = (await res.json()) as {
    error?: string;
    profile?: ApiProfile | null;
    unavailable?: boolean;
  };
  if (body.unavailable) return null;
  if (!res.ok) throw new Error(body.error ?? "Failed to load committee profile");
  return body.profile ?? null;
}

async function fetchMembers(committee: CommitteeSlug): Promise<CommitteeMemberRow[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-members?committee=${encodeURIComponent(committee)}`,
  );
  const body = (await res.json()) as {
    error?: string;
    members?: ApiMember[];
    unavailable?: boolean;
  };
  if (body.unavailable) return [];
  if (!res.ok) throw new Error(body.error ?? "Failed to load committee members");
  return (body.members ?? []).map(mapMember);
}

export function useCommitteeProfile(committee: CommitteeSlug | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...COMMITTEE_PROFILE_KEY, committee],
    queryFn: () => fetchProfile(committee!),
    enabled: Boolean(committee),
  });

  const saveProfile = useCallback(
    async (input: {
      name: string;
      description?: string;
      cadence?: string;
      meeting_day?: string;
      location?: string;
      website_slug?: string | null;
      publish_status?: "draft" | "published";
    }) => {
      if (!committee) throw new Error("No committee");
      const res = await fetch(`${getApiBase()}/api/committee-profiles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ committee, ...input }),
      });
      const body = (await res.json()) as { error?: string; unavailable?: boolean };
      if (!res.ok) throw new Error(body.error ?? "Failed to save profile");
      await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_PROFILE_KEY, committee] });
    },
    [committee, queryClient],
  );

  return {
    profile: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    saveProfile,
  };
}

export function useCommitteeMembers(committee: CommitteeSlug | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...COMMITTEE_MEMBERS_KEY, committee],
    queryFn: () => fetchMembers(committee!),
    enabled: Boolean(committee),
  });

  const addMember = useCallback(
    async (personId: string, title: CommitteeMemberTitle = "Member") => {
      if (!committee) throw new Error("No committee");
      const res = await fetch(`${getApiBase()}/api/committee-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          committee,
          person_id: personId,
          title: titleToApi(title),
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to add member");
      await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEMBERS_KEY, committee] });
    },
    [committee, queryClient],
  );

  const updateMemberTitle = useCallback(
    async (id: string, title: CommitteeMemberTitle) => {
      if (!committee) throw new Error("No committee");
      const res = await fetch(`${getApiBase()}/api/committee-members/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleToApi(title) }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to update member");
      await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEMBERS_KEY, committee] });
    },
    [committee, queryClient],
  );

  const removeMember = useCallback(
    async (id: string) => {
      if (!committee) throw new Error("No committee");
      const res = await fetch(`${getApiBase()}/api/committee-members/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to remove member");
      await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEMBERS_KEY, committee] });
    },
    [committee, queryClient],
  );

  return {
    members: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    addMember,
    updateMemberTitle,
    removeMember,
  };
}
