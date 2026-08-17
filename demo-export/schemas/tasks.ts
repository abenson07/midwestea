/**
 * Task templates + checklist instances.
 */

import type { WorkflowContext } from "./comm_settings";

export interface TaskTemplates {
  id: string;
  context: WorkflowContext;
  event_template_id: string | null;
  title: string;
  description: string | null;
  offset_days: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskTemplatesInsert {
  context: WorkflowContext;
  event_template_id?: string | null;
  title: string;
  description?: string | null;
  offset_days: number;
  is_active?: boolean;
}

export interface Tasks {
  id: string;
  context: WorkflowContext;
  context_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  offset_days: number;
  is_complete: boolean;
  is_skipped: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface TasksInsert {
  context: WorkflowContext;
  context_id: string;
  template_id?: string | null;
  title: string;
  description?: string | null;
  offset_days: number;
  is_complete?: boolean;
  is_skipped?: boolean;
}

export interface TasksUpdate {
  title?: string;
  description?: string | null;
  offset_days?: number;
  is_complete?: boolean;
  is_skipped?: boolean;
  completed_at?: string | null;
}
