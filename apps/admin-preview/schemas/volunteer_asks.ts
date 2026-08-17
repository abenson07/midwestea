/**
 * Volunteer Asks Schema
 * Based on Supabase schema
 */

import type { CommitteeSlug } from "./committee_meetings";

export type VolunteerCommitmentType = "one_off" | "ongoing";
export type VolunteerCommitmentUnit = "minutes" | "hours";

export interface VolunteerAsks {
  id: string; // uuid
  title: string; // text, not null
  description: string | null; // text
  commitment_type: VolunteerCommitmentType;
  commitment_unit: VolunteerCommitmentUnit;
  commitment_quantity: number; // numeric
  quantity: number; // integer — slots needed
  event_id: string | null; // uuid (references events)
  committee: CommitteeSlug;
  auto_accept: boolean;
  auto_response_body: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface VolunteerAsksInsert {
  title: string;
  description?: string | null;
  commitment_type: VolunteerCommitmentType;
  commitment_unit: VolunteerCommitmentUnit;
  commitment_quantity: number;
  quantity: number;
  event_id?: string | null;
  committee: CommitteeSlug;
  auto_accept?: boolean;
  auto_response_body?: string | null;
}

export interface VolunteerAsksUpdate {
  title?: string;
  description?: string | null;
  commitment_type?: VolunteerCommitmentType;
  commitment_unit?: VolunteerCommitmentUnit;
  commitment_quantity?: number;
  quantity?: number;
  event_id?: string | null;
  committee?: CommitteeSlug;
  auto_accept?: boolean;
  auto_response_body?: string | null;
}
