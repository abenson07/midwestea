/**
 * Events Schema
 * Dashboard-native events (parallel track to Webflow calendar).
 *
 * `field_data` jsonb conventions (see `src/lib/events/eventData.ts`):
 * - location, status, capacity, image_url, description, address
 * - kind: "council" | "external" | "committee_meeting"
 * - qr_code_id (legacy), qr_codes: [{ id, description? }]
 * - webflow_item_id (migration bridge), sponsorship_goal_cents, marketing
 *
 * Owning committee lives on `committee` (typed column), not Category.
 */

import type { CommitteeSlug } from "./committee_meetings";

export type EventPublishStatus = "draft" | "published";

export interface Events {
  id: string;
  name: string | null;
  date: string | null;
  event_template_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  slug: string | null;
  committee: CommitteeSlug | null;
  field_data: Record<string, unknown>;
  publish_status: EventPublishStatus;
  created_at: string;
  updated_at: string;
}

export interface EventsInsert {
  name?: string | null;
  date?: string | null;
  event_template_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  slug?: string | null;
  committee?: CommitteeSlug | null;
  field_data?: Record<string, unknown>;
  publish_status?: EventPublishStatus;
}

export interface EventsUpdate {
  name?: string | null;
  date?: string | null;
  event_template_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  slug?: string | null;
  committee?: CommitteeSlug | null;
  field_data?: Record<string, unknown>;
  publish_status?: EventPublishStatus;
}
