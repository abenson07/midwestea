import Stripe from "stripe";

let singleton: Stripe | undefined;

/** Server-only. Returns null if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  if (!singleton) singleton = new Stripe(secret);
  return singleton;
}
