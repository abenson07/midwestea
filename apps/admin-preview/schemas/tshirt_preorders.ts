/**
 * T-shirt preorders from public landing (Stripe Checkout).
 */

export type TshirtPreorderStatus = "pending" | "paid" | "refunded" | "failed";

export type TshirtLineItem = {
  category: "adult" | "child";
  size: string;
  quantity: number;
};

export interface TshirtPreorders {
  id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address: Record<string, unknown> | null;
  line_items: TshirtLineItem[];
  amount_cents: number;
  currency: string;
  status: TshirtPreorderStatus;
  created_at: string;
  updated_at: string;
}

export interface TshirtPreordersInsert {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address?: Record<string, unknown> | null;
  line_items: TshirtLineItem[];
  amount_cents: number;
  currency?: string;
  status?: TshirtPreorderStatus;
}
