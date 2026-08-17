/**
 * Event templates — repeatable events spawned in the dashboard.
 */

export interface EventTemplates {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  default_field_data: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTemplatesInsert {
  name: string;
  slug: string;
  description?: string | null;
  default_field_data?: Record<string, unknown>;
  is_active?: boolean;
}

export interface EventTemplatesUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  default_field_data?: Record<string, unknown>;
  is_active?: boolean;
}
