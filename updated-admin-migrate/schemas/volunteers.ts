/**
 * Volunteers (signup) Schema — join between people and volunteer_asks
 * Based on Supabase schema
 */

export type VolunteerSignupStatus = "pending" | "accepted";

export interface Volunteers {
  id: string; // uuid
  volunteer_ask_id: string; // uuid (references volunteer_asks)
  person_id: string; // uuid (references people)
  status: VolunteerSignupStatus;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string; // timestamptz
}

export interface VolunteersInsert {
  volunteer_ask_id: string;
  person_id: string;
  status?: VolunteerSignupStatus;
  accepted_at?: string | null;
  accepted_by?: string | null;
}

export interface VolunteersUpdate {
  status?: VolunteerSignupStatus;
  accepted_at?: string | null;
  accepted_by?: string | null;
}
