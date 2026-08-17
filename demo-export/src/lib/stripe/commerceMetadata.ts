/** Stripe Checkout Session metadata for public commerce landings. */

export const COMMERCE_FLOW = {
  TSHIRT: "tshirt_preorder",
  FUNDRAISER: "fundraiser",
  SHOP: "shop_order",
  MEMBERSHIP: "membership",
} as const;

export type CommerceFlow =
  (typeof COMMERCE_FLOW)[keyof typeof COMMERCE_FLOW];

export const COMMERCE_METADATA_KEYS = {
  flow: "flow",
  lineItems: "line_items",
  customerName: "customer_name",
  customerEmail: "customer_email",
  shippingLine1: "shipping_line1",
  shippingLine2: "shipping_line2",
  shippingCity: "shipping_city",
  shippingState: "shipping_state",
  shippingPostalCode: "shipping_postal_code",
  donationTier: "donation_tier",
  membershipTier: "membership_tier",
  billingMode: "billing_mode",
  newsletterOptIn: "newsletter_opt_in",
  digestOptIn: "digest_opt_in",
  volunteerOptIn: "volunteer_opt_in",
} as const;

export function isCommerceFlow(value: string | undefined): value is CommerceFlow {
  return (
    value === COMMERCE_FLOW.TSHIRT ||
    value === COMMERCE_FLOW.FUNDRAISER ||
    value === COMMERCE_FLOW.SHOP ||
    value === COMMERCE_FLOW.MEMBERSHIP
  );
}
