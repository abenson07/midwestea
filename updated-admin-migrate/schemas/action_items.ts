/**
 * Action items schema — person-assigned follow-ups (not event/leaflet tasks).
 */

export type ActionItemStatus = "open" | "done" | "canceled";

export type ActionItemSource = "ai" | "manual" | "bulk";

export interface ActionItems {
  id: string;
  title: string;
  description: string | null;
  assignee_person_id: string | null;
  committee_meeting_id: string | null;
  initiative_id: string | null;
  status: ActionItemStatus;
  due_at: string | null;
  source: ActionItemSource;
  sort_order: number;
  completed_at: string | null;
  completed_by: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItemsInsert {
  title: string;
  description?: string | null;
  assignee_person_id?: string | null;
  committee_meeting_id?: string | null;
  initiative_id?: string | null;
  status?: ActionItemStatus;
  due_at?: string | null;
  source?: ActionItemSource;
  sort_order?: number;
  completed_at?: string | null;
  completed_by?: string | null;
  reminder_sent_at?: string | null;
}

export interface ActionItemsUpdate {
  title?: string;
  description?: string | null;
  assignee_person_id?: string | null;
  committee_meeting_id?: string | null;
  initiative_id?: string | null;
  status?: ActionItemStatus;
  due_at?: string | null;
  source?: ActionItemSource;
  sort_order?: number;
  completed_at?: string | null;
  completed_by?: string | null;
  reminder_sent_at?: string | null;
  updated_at?: string;
}
