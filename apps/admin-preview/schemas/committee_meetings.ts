/**
 * Committee meetings schema
 */

export type CommitteeSlug =
  | "events"
  | "outreach"
  | "hub"
  | "leaflet"
  | "communications"
  | "steering"
  | "executive_board"
  | "businesses";

export type MeetingLocationType = "in_person" | "remote" | "hybrid";

export type MinutesStatus = "draft" | "submitted" | "processing" | "ready" | "error";

export type MinutesSource = "written" | "transcript" | "audio" | "file";

export type MeetingMinutesBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export type StructuredMinutes = {
  blocks: MeetingMinutesBlock[];
};

export interface CommitteeMeetings {
  id: string;
  event_id: string;
  committee: CommitteeSlug;
  location_type: MeetingLocationType;
  location: string | null;
  google_calendar_url: string | null;
  agenda_json: Record<string, unknown> | null;
  raw_transcript: string | null;
  structured_minutes: StructuredMinutes | null;
  minutes_status: MinutesStatus;
  minutes_error: string | null;
  minutes_source: MinutesSource | null;
  minutes_attachment_url: string | null;
  audio_url: string | null;
  submitted_at: string | null;
  submitted_by: string | null;
  website_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMeetingsInsert {
  event_id: string;
  committee: CommitteeSlug;
  location_type?: MeetingLocationType;
  location?: string | null;
  google_calendar_url?: string | null;
  agenda_json?: Record<string, unknown> | null;
  raw_transcript?: string | null;
  structured_minutes?: StructuredMinutes | null;
  minutes_status?: MinutesStatus;
  minutes_error?: string | null;
  minutes_source?: MinutesSource | null;
  minutes_attachment_url?: string | null;
  audio_url?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  website_slug?: string | null;
}

export interface CommitteeMeetingsUpdate {
  committee?: CommitteeSlug;
  location_type?: MeetingLocationType;
  location?: string | null;
  google_calendar_url?: string | null;
  agenda_json?: Record<string, unknown> | null;
  raw_transcript?: string | null;
  structured_minutes?: StructuredMinutes | null;
  minutes_status?: MinutesStatus;
  minutes_error?: string | null;
  minutes_source?: MinutesSource | null;
  minutes_attachment_url?: string | null;
  audio_url?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  website_slug?: string | null;
  updated_at?: string;
}

export interface CommitteeMeetingAttendees {
  id: string;
  meeting_id: string;
  person_id: string;
  created_at: string;
}

export interface CommitteeMeetingAttendeesInsert {
  meeting_id: string;
  person_id: string;
}

export const COMMITTEE_LABELS: Record<CommitteeSlug, string> = {
  events: "Events",
  outreach: "Outreach",
  hub: "Hub",
  leaflet: "Leaflet",
  communications: "Communications",
  steering: "Steering",
  executive_board: "Executive Board",
  businesses: "Businesses",
};

export function isCommitteeSlug(value: string): value is CommitteeSlug {
  return Object.prototype.hasOwnProperty.call(COMMITTEE_LABELS, value);
}

export const WEBSITE_COMMITTEE_SLUG: Partial<Record<CommitteeSlug, string>> = {
  outreach: "advocacy",
  hub: "emergency-hub",
  leaflet: "newsletter",
  businesses: "business-committee",
};
