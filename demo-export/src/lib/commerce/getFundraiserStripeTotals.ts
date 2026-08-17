import type Stripe from "stripe";
import { COMMERCE_METADATA_KEYS } from "@/lib/stripe/commerceMetadata";
import { getStripe } from "@/lib/stripe/server";

const DEFAULT_FUNDRAISER_PRODUCT_ID = "prod_UY5ikFz5s0CtbV";

export type FundraiserStripeTotals = {
  productId: string;
  productName: string;
  count: number;
  totalCents: number;
  averageCents: number;
  medianCents: number;
  minCents: number;
  maxCents: number;
  byTier: Record<string, number>;
  queriedAt: string;
};

function getFundraiserProductId(): string {
  return (
    process.env.STRIPE_DONATION_PRODUCT_ID?.trim() ||
    DEFAULT_FUNDRAISER_PRODUCT_ID
  );
}

function sessionMatchesProduct(
  session: Stripe.Checkout.Session,
  productId: string,
  priceIds: Set<string>
): boolean {
  const items = session.line_items?.data ?? [];
  return items.some((item) => {
    const price = item.price;
    if (!price) return false;
    const pid =
      typeof price.product === "string" ? price.product : price.product?.id;
    return pid === productId || priceIds.has(price.id);
  });
}

function medianCents(amounts: number[]): number {
  if (amounts.length === 0) return 0;
  const sorted = [...amounts].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/** Server-only. Totals from paid Checkout sessions for the fundraiser product. */
export async function getFundraiserStripeTotals(): Promise<FundraiserStripeTotals> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const productId = getFundraiserProductId();
  const product = await stripe.products.retrieve(productId);
  const prices = await stripe.prices.list({ product: productId, limit: 100 });
  const priceIds = new Set(prices.data.map((price) => price.id));

  const amounts: number[] = [];
  const byTier: Record<string, number> = {};

  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      status: "complete",
      limit: 100,
      starting_after: startingAfter,
      expand: ["data.line_items"],
    });

    for (const session of sessions.data) {
      if (session.payment_status !== "paid") continue;
      if (!sessionMatchesProduct(session, productId, priceIds)) continue;

      const cents = session.amount_total ?? 0;
      amounts.push(cents);

      const tier =
        session.metadata?.[COMMERCE_METADATA_KEYS.donationTier] ?? "unknown";
      byTier[tier] = (byTier[tier] ?? 0) + 1;
    }

    hasMore = sessions.has_more;
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1]?.id;
    }
  }

  const count = amounts.length;
  const totalCents = amounts.reduce((sum, amount) => sum + amount, 0);
  const averageCents = count ? Math.round(totalCents / count) : 0;

  return {
    productId,
    productName: product.name,
    count,
    totalCents,
    averageCents,
    medianCents: medianCents(amounts),
    minCents: count ? Math.min(...amounts) : 0,
    maxCents: count ? Math.max(...amounts) : 0,
    byTier,
    queriedAt: new Date().toISOString(),
  };
}
