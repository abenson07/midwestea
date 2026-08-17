/**
 * Comm settings — timed email / outreach steps (Resend template ids).
 */

export type WorkflowContext = "leaflet" | "event" | "membership";

export type CommTrigger = "anchor_offset" | "on_activate";

export interface CommSettings {
  id: string;
  context: WorkflowContext;
  event_template_id: string | null;
  name: string;
  step_key: string;
  resend_template_id: string;
  trigger: CommTrigger;
  offset_days: number | null;
  offset_time: string;
  requires_response: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommSettingsInsert {
  context: WorkflowContext;
  event_template_id?: string | null;
  name: string;
  step_key: string;
  resend_template_id: string;
  trigger?: CommTrigger;
  offset_days?: number | null;
  offset_time?: string;
  requires_response?: boolean;
  is_enabled?: boolean;
}

export interface CommSettingsUpdate {
  name?: string;
  resend_template_id?: string;
  trigger?: CommTrigger;
  offset_days?: number | null;
  offset_time?: string;
  requires_response?: boolean;
  is_enabled?: boolean;
}
