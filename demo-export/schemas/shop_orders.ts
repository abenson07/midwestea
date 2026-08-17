/**
 * Merch shop orders from the public shop (Stripe Checkout).
 */

export type ShopOrderStatus = "pending" | "paid" | "refunded" | "failed";
export type ShopOrderFulfillment = "preorder" | "in_stock";

export type ShopLineItem = {
  product_slug: string;
  product_name: string;
  variant: string;
  quantity: number;
  unit_amount_cents: number;
  fulfillment: ShopOrderFulfillment;
};

export interface ShopOrders {
  id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address: Record<string, unknown> | null;
  line_items: ShopLineItem[];
  amount_cents: number;
  currency: string;
  status: ShopOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface ShopOrdersInsert {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  customer_name: string;
  customer_email: string;
  shipping_address?: Record<string, unknown> | null;
  line_items: ShopLineItem[];
  amount_cents: number;
  currency?: string;
  status?: ShopOrderStatus;
}
