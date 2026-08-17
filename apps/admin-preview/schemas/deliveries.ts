/**
 * Deliveries — per route per leaflet edition.
 */

import type { DeliveryResponse } from "./delivery_enums";

export type { DeliveryResponse } from "./delivery_enums";

export interface Deliveries {
  id: string;
  person_id: string | null;
  route_id: string;
  date_delivered: string | null;
  leaflet_id: string | null;
  leaflet_count: number | null;
  is_skipped: boolean;
  response: DeliveryResponse;
  responded_at: string | null;
  leaflets_delivered: number | null;
  leaflets_leftover: number | null;
  building_contact_name: string | null;
  building_contact_email: string | null;
  building_contact_phone: string | null;
  building_contact_is_deliverer: boolean;
  comm_pre_distribution_reminder_sent_at: string | null;
  comm_completion_followup_sent_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DeliveriesInsert {
  person_id?: string | null;
  route_id: string;
  date_delivered?: string | null;
  leaflet_id?: string | null;
  leaflet_count?: number | null;
  is_skipped?: boolean;
  response?: DeliveryResponse;
  responded_at?: string | null;
  leaflets_delivered?: number | null;
  leaflets_leftover?: number | null;
  building_contact_name?: string | null;
  building_contact_email?: string | null;
  building_contact_phone?: string | null;
  building_contact_is_deliverer?: boolean;
}

export interface DeliveriesUpdate {
  person_id?: string | null;
  route_id?: string;
  date_delivered?: string | null;
  leaflet_id?: string | null;
  leaflet_count?: number | null;
  is_skipped?: boolean;
  response?: DeliveryResponse;
  responded_at?: string | null;
  leaflets_delivered?: number | null;
  leaflets_leftover?: number | null;
  building_contact_name?: string | null;
  building_contact_email?: string | null;
  building_contact_phone?: string | null;
  building_contact_is_deliverer?: boolean;
  comm_pre_distribution_reminder_sent_at?: string | null;
  comm_completion_followup_sent_at?: string | null;
}
