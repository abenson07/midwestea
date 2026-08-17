/**
 * Sponsorship items — reusable catalog of sponsorship levels/products,
 * and which event templates (or leaflets generally) suggest each one.
 */

import type { WorkflowContext } from "./comm_settings";

export interface SponsorshipItems {
  id: string;
  name: string;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipItemsInsert {
  name: string;
  amount: number;
  description?: string | null;
}

export interface SponsorshipItemsUpdate {
  name?: string;
  amount?: number;
  description?: string | null;
}

/** `context` is constrained to "event" | "leaflet" — "membership" is not a valid sponsorship context. */
export interface SponsorshipItemTemplates {
  id: string;
  sponsorship_item_id: string;
  context: WorkflowContext;
  event_template_id: string | null;
  quantity_available: number;
  is_active: boolean;
  created_at: string;
}

export interface SponsorshipItemTemplatesInsert {
  sponsorship_item_id: string;
  context: WorkflowContext;
  event_template_id?: string | null;
  quantity_available?: number;
  is_active?: boolean;
}

export interface SponsorshipItemTemplatesUpdate {
  quantity_available?: number;
  is_active?: boolean;
}

/** The live, editable "menu" of items actually offered by one specific event or leaflet. One of event_id/leaflet_id is set, never both. */
export interface SponsorshipItemOfferings {
  id: string;
  sponsorship_item_id: string;
  event_id: string | null;
  leaflet_id: string | null;
  quantity_available: number;
  created_at: string;
}

export interface SponsorshipItemOfferingsInsert {
  sponsorship_item_id: string;
  event_id?: string | null;
  leaflet_id?: string | null;
  quantity_available?: number;
}

export interface SponsorshipItemOfferingsUpdate {
  quantity_available?: number;
}
