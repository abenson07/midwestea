/**
 * Individual shirt units from shop preorders (one row per shirt).
 */

export type ShirtPreorderItemStatus =
  | "pending"
  | "paid"
  | "picked_up"
  | "refunded"
  | "failed";

export interface ShirtPreorderItems {
  id: string;
  person_id: string;
  product_slug: string;
  product_name: string;
  variant: string;
  unit_amount_cents: number;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  status: ShirtPreorderItemStatus;
  created_at: string;
  updated_at: string;
}

export interface ShirtPreorderItemsInsert {
  person_id: string;
  product_slug: string;
  product_name: string;
  variant: string;
  unit_amount_cents: number;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  status?: ShirtPreorderItemStatus;
}
