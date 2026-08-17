"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeMeetings, People } from "@/types/database";
import type { ActionItems } from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";

export const COMMITTEE_MEETING_QUERY_KEY = ["committee-meeting"] as const;

export type MeetingAttendee = {
  id: string;
  person_id: string;
  person: Pick<People, "id" | "full_name" | "email"> | null;
};

export type ActionItemWithAssignee = ActionItems & {
  assignee: Pick<People, "id" | "full_name" | "email"> | null;
};

export type CommitteeMeetingWithRelations = CommitteeMeetings & {
  attendees: MeetingAttendee[];
  action_items: ActionItemWithAssignee[];
};

const MEETING_BY_EVENT_SELECT = `
  *,
  committee_meeting_attendees (
    id,
    person_id,
    people ( id, full_name, email )
  ),
  action_items (
    id,
    title,
    description,
    assignee_person_id,
    committee_meeting_id,
    status,
    due_at,
    source,
    sort_order,
    completed_at,
    completed_by,
    created_at,
    updated_at,
    people:assignee_person_id ( id, full_name, email )
  )
`;

function mapMeetingRow(row: Record<string, unknown>): CommitteeMeetingWithRelations {
  const attendeesRaw = (row.committee_meeting_attendees as Array<Record<string, unknown>>) ?? [];
  const actionItemsRaw = (row.action_items as Array<Record<string, unknown>>) ?? [];

  const attendees: MeetingAttendee[] = attendeesRaw.map((a) => {
    const people = a.people as Pick<People, "id" | "full_name" | "email"> | null;
    return {
      id: a.id as string,
      person_id: a.person_id as string,
      person: people,
    };
  });

  const action_items: ActionItemWithAssignee[] = actionItemsRaw
    .map((item) => {
      const assignee = item.people as Pick<People, "id" | "full_name" | "email"> | null;
      const { people: _p, ...rest } = item;
      return {
        ...(rest as unknown as ActionItems),
        assignee,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  const { committee_meeting_attendees: _a, action_items: _i, ...meeting } = row;

  return {
    ...(meeting as unknown as CommitteeMeetings),
    attendees,
    action_items,
  };
}

async function fetchMeetingByEventId(eventId: string): Promise<CommitteeMeetingWithRelations | null> {
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");

  const { data, error } = await supabaseClient
    .from("committee_meetings")
    .select(MEETING_BY_EVENT_SELECT)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapMeetingRow(data as Record<string, unknown>);
}

export type CreateCommitteeMeetingPayload = {
  committee: CommitteeSlug;
  starts_at: string;
  ends_at?: string | null;
  location_type: "in_person" | "remote" | "hybrid";
  location?: string | null;
  google_calendar_url?: string | null;
};

export function useCommitteeMeeting(eventId: string | null, { autoFetch = true } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...COMMITTEE_MEETING_QUERY_KEY, eventId],
    queryFn: () => fetchMeetingByEventId(eventId!),
    enabled: autoFetch && Boolean(eventId),
  });

  async function patchMeeting(
    meetingId: string,
    patch: Record<string, unknown>,
  ): Promise<CommitteeMeetingWithRelations | null> {
    const res = await fetch(`${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update meeting");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_QUERY_KEY, eventId] });
    return fetchMeetingByEventId(eventId!);
  }

  async function setAttendees(meetingId: string, personIds: string[]) {
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/attendees`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_ids: personIds }),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update attendees");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_QUERY_KEY, eventId] });
  }

  async function submitMinutes(meetingId: string) {
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/submit-minutes`,
      { method: "POST" },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to submit minutes");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_QUERY_KEY, eventId] });
  }

  return {
    meeting: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    patchMeeting,
    setAttendees,
    submitMinutes,
  };
}

export async function createCommitteeMeetingApi(
  payload: CreateCommitteeMeetingPayload,
): Promise<{ event: { id: string }; meeting: CommitteeMeetings }> {
  const res = await fetch(`${getApiBase()}/api/committee-meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as {
    error?: string;
    event?: { id: string };
    meeting?: CommitteeMeetings;
  };
  if (!res.ok) throw new Error(body.error ?? "Failed to create committee meeting");
  return { event: body.event!, meeting: body.meeting! };
}
