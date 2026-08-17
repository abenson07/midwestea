/**
 * Committee website interest signups (Slack still notified separately).
 */

import type { CommitteeSlug } from "./committee_meetings";

export type CommitteeInterestStatus = "pending" | "handled" | "auto_accepted";

export type CommitteeInterestSource =
  | "join-card"
  | "meeting-signup"
  | "zoning-workshop"
  | "volunteer-opportunity"
  | "other";

export interface CommitteeInterests {
  id: string;
  name: string;
  contact: string;
  committee: CommitteeSlug;
  source: CommitteeInterestSource;
  opportunity_title: string | null;
  volunteer_ask_id: string | null;
  event_id: string | null;
  status: CommitteeInterestStatus;
  responded_at: string | null;
  responded_by: string | null;
  response_email_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface CommitteeInterestsInsert {
  name: string;
  contact: string;
  committee: CommitteeSlug;
  source?: CommitteeInterestSource;
  opportunity_title?: string | null;
  volunteer_ask_id?: string | null;
  event_id?: string | null;
  status?: CommitteeInterestStatus;
  responded_at?: string | null;
  responded_by?: string | null;
  response_email_id?: string | null;
  notes?: string | null;
}

export interface CommitteeInterestsUpdate {
  status?: CommitteeInterestStatus;
  responded_at?: string | null;
  responded_by?: string | null;
  response_email_id?: string | null;
  notes?: string | null;
  volunteer_ask_id?: string | null;
  event_id?: string | null;
  opportunity_title?: string | null;
}
