/**
 * Fundraising donations from public landing (Stripe Checkout).
 */

export type FundraisingDonationTier =
  | "individual"
  | "household"
  | "champ"
  | "custom";

export type FundraisingDonationStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "failed";

export interface FundraisingDonations {
  id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  donation_tier: FundraisingDonationTier;
  amount_cents: number;
  currency: string;
  customer_email: string | null;
  status: FundraisingDonationStatus;
  created_at: string;
  updated_at: string;
}

export interface FundraisingDonationsInsert {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  donation_tier: FundraisingDonationTier;
  amount_cents: number;
  currency?: string;
  customer_email?: string | null;
  status?: FundraisingDonationStatus;
}
