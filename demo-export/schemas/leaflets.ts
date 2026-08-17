/**
 * Leaflets — time-bound delivery editions.
 */

export type LeafletStatus = "planned" | "active" | "closed";

export interface Leaflets {
  id: string;
  title: string;
  distribution_date: string;
  sponsorship_due_date: string | null;
  delivery_date: string | null;
  status: LeafletStatus;
  activated_at: string | null;
  closed_at: string | null;
  print_cost_cents: number | null;
  sponsorship_goal_cents: number | null;
  membership_qr_code_id: string | null;
  open_routes_qr_code_id: string | null;
  comm_initial_confirmation_sent_at: string | null;
  comm_distribution_day_pickup_sent_at: string | null;
  comm_delivery_complete_prompt_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeafletsInsert {
  title: string;
  distribution_date: string;
  sponsorship_due_date?: string | null;
  delivery_date?: string | null;
  status?: LeafletStatus;
  activated_at?: string | null;
  closed_at?: string | null;
  print_cost_cents?: number | null;
  sponsorship_goal_cents?: number | null;
  membership_qr_code_id?: string | null;
  open_routes_qr_code_id?: string | null;
}

export interface LeafletsUpdate {
  title?: string;
  distribution_date?: string;
  sponsorship_due_date?: string | null;
  delivery_date?: string | null;
  status?: LeafletStatus;
  activated_at?: string | null;
  closed_at?: string | null;
  print_cost_cents?: number | null;
  sponsorship_goal_cents?: number | null;
  membership_qr_code_id?: string | null;
  open_routes_qr_code_id?: string | null;
  comm_initial_confirmation_sent_at?: string | null;
  comm_distribution_day_pickup_sent_at?: string | null;
  comm_delivery_complete_prompt_sent_at?: string | null;
}
