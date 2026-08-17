"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommitteeSlug, MinutesStatus, StructuredMinutes } from "schemas/committee_meetings";
import type { ActionItemStatus } from "schemas/action_items";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { getSampleCommitteeMeetings } from "@/data/mocks/committees";

export const COMMITTEE_MEETINGS_LIST_KEY = ["committee-meetings", "list"] as const;
export const COMMITTEE_MEETING_BY_ID_KEY = ["committee-meetings", "by-id"] as const;
export const OUTSTANDING_ACTION_ITEMS_KEY = ["committee-meetings", "outstanding"] as const;

export type CommitteeMeetingListRow = {
  id: string;
  event_id: string;
  committee: CommitteeSlug;
  location_type: string;
  location: string | null;
  minutes_status: MinutesStatus;
  website_slug: string | null;
  created_at: string;
  updated_at: string;
  events: {
    id: string;
    name: string;
    starts_at: string | null;
    ends_at: string | null;
  } | null;
};

export type MeetingActionItem = {
  id: string;
  title: string;
  description: string | null;
  assignee_person_id: string | null;
  status: ActionItemStatus;
  due_at: string | null;
  source: string;
  sort_order: number;
  assignee?: { id: string; full_name: string; email: string | null } | null;
  people?: { id: string; full_name: string; email: string | null } | null;
  committee_meeting_id?: string | null;
  committee_meetings?: {
    id: string;
    committee: string;
    event_id: string;
    events: { name: string; starts_at: string | null } | null;
  } | null;
};

export type CommitteeMeetingDetail = {
  id: string;
  event_id: string;
  committee: CommitteeSlug;
  location_type: string;
  location: string | null;
  google_calendar_url: string | null;
  agenda_json: Record<string, unknown> | null;
  raw_transcript: string | null;
  structured_minutes: StructuredMinutes | null;
  minutes_status: MinutesStatus;
  minutes_error: string | null;
  minutes_source: string | null;
  minutes_attachment_url: string | null;
  audio_url: string | null;
  website_slug: string | null;
  committee_meeting_attendees?: Array<{
    id: string;
    person_id: string;
    people: { id: string; full_name: string; email: string | null } | null;
  }>;
  action_items?: MeetingActionItem[];
  events?: { name: string; starts_at: string | null } | null;
};

async function fetchMeetings(committee: CommitteeSlug): Promise<CommitteeMeetingListRow[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-meetings?committee=${encodeURIComponent(committee)}`,
  );
  const body = (await res.json()) as { error?: string; meetings?: CommitteeMeetingListRow[] };
  if (!res.ok) throw new Error(body.error ?? "Failed to load meetings");
  return body.meetings ?? [];
}

async function fetchMeeting(meetingId: string): Promise<CommitteeMeetingDetail> {
  const res = await fetch(`${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}`);
  const body = (await res.json()) as { error?: string; meeting?: CommitteeMeetingDetail };
  if (!res.ok) throw new Error(body.error ?? "Failed to load meeting");
  if (!body.meeting) throw new Error("Meeting not found");
  return body.meeting;
}

async function fetchOutstanding(meetingId: string): Promise<MeetingActionItem[]> {
  const res = await fetch(
    `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/outstanding`,
  );
  const body = (await res.json()) as { error?: string; action_items?: MeetingActionItem[] };
  if (!res.ok) throw new Error(body.error ?? "Failed to load outstanding items");
  return body.action_items ?? [];
}

export function useCommitteeMeetingsList(committee: CommitteeSlug | null) {
  const { enabled: demo } = useDemoModeOptional();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...COMMITTEE_MEETINGS_LIST_KEY, committee],
    queryFn: () => fetchMeetings(committee!),
    enabled: Boolean(committee) && !demo,
  });

  const demoMeetings = useMemo(() => {
    if (!demo || !committee) return [] as CommitteeMeetingListRow[];
    return getSampleCommitteeMeetings(committee) as CommitteeMeetingListRow[];
  }, [demo, committee]);

  return {
    meetings: demo ? demoMeetings : (data ?? []),
    loading: demo ? false : isLoading,
    error: demo ? null : error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      if (!demo) await refetch();
    },
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETINGS_LIST_KEY, committee] }),
  };
}

export function useCommitteeMeetingById(meetingId: string | null) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId],
    queryFn: () => fetchMeeting(meetingId!),
    enabled: Boolean(meetingId),
  });

  async function patchMeeting(patch: Record<string, unknown>) {
    if (!meetingId) throw new Error("No meeting");
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update meeting");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  async function postAgenda() {
    if (!meetingId) throw new Error("No meeting");
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/post-agenda`,
      { method: "POST" },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to post agenda");
  }

  async function submitMinutes() {
    if (!meetingId) throw new Error("No meeting");
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/submit-minutes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipPublish: true }),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to generate minutes");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  async function publishMinutes(payload: {
    next_meeting_starts_at: string;
    next_location_type?: string;
    next_location?: string | null;
  }) {
    if (!meetingId) throw new Error("No meeting");
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/publish-minutes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to publish minutes");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
    await queryClient.invalidateQueries({ queryKey: COMMITTEE_MEETINGS_LIST_KEY });
  }

  async function transcribeAudio(file: File) {
    if (!meetingId) throw new Error("No meeting");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/transcribe-audio`,
      { method: "POST", body: form },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to transcribe audio");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  async function uploadMinutesFile(file: File) {
    if (!meetingId) throw new Error("No meeting");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${getApiBase()}/api/committee-meetings/${encodeURIComponent(meetingId)}/upload-file`,
      { method: "POST", body: form },
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to upload file");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  return {
    meeting: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    patchMeeting,
    postAgenda,
    submitMinutes,
    publishMinutes,
    transcribeAudio,
    uploadMinutesFile,
  };
}

export function useOutstandingActionItems(meetingId: string | null) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...OUTSTANDING_ACTION_ITEMS_KEY, meetingId],
    queryFn: () => fetchOutstanding(meetingId!),
    enabled: Boolean(meetingId),
  });

  async function patchActionItem(
    id: string,
    patch: {
      status?: ActionItemStatus;
      assignee_person_id?: string | null;
      due_at?: string | null;
      title?: string;
      description?: string | null;
    },
  ) {
    const res = await fetch(`${getApiBase()}/api/action-items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update action item");
    await queryClient.invalidateQueries({ queryKey: [...OUTSTANDING_ACTION_ITEMS_KEY, meetingId] });
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  async function createActionItem(payload: {
    title: string;
    description?: string | null;
    assignee_person_id?: string | null;
    due_at?: string | null;
    committee_meeting_id?: string | null;
  }) {
    const res = await fetch(`${getApiBase()}/api/action-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to create action item");
    await queryClient.invalidateQueries({ queryKey: [...COMMITTEE_MEETING_BY_ID_KEY, meetingId] });
  }

  return {
    items: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    patchActionItem,
    createActionItem,
  };
}

/** Convert plain text into a TipTap doc JSON. */
export function textToAgendaJson(text: string): Record<string, unknown> {
  const paragraphs = text.split(/\n/).map((line) => line);
  return {
    type: "doc",
    content:
      paragraphs.length === 0
        ? [{ type: "paragraph" }]
        : paragraphs.map((line) =>
            line
              ? { type: "paragraph", content: [{ type: "text", text: line }] }
              : { type: "paragraph" },
          ),
  };
}

/** Convert plain written minutes into structured_minutes blocks. */
export function textToStructuredMinutes(text: string): StructuredMinutes {
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    blocks: paragraphs.map((p) =>
      p.startsWith("# ")
        ? { kind: "heading" as const, text: p.slice(2) }
        : { kind: "paragraph" as const, text: p },
    ),
  };
}

export function structuredMinutesToText(minutes: StructuredMinutes | null): string {
  if (!minutes?.blocks?.length) return "";
  return minutes.blocks
    .map((b) => {
      if (b.kind === "heading") return `# ${b.text}`;
      if (b.kind === "list") return b.items.map((i) => `• ${i}`).join("\n");
      return b.text;
    })
    .join("\n\n");
}
