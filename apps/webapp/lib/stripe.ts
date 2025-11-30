import Stripe from 'stripe';

// Server-side Stripe client
export function getStripeClient(secretKey?: string): Stripe {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  return new Stripe(key, {
    typescript: true,
  });
}

// Product and price data types
export interface ProductWithPrice {
  product: Stripe.Product;
  price: Stripe.Price;
  amount: number;
  currency: string;
  formattedAmount: string;
}

/**
 * Fetches product and price details from Stripe
 */
export async function getProductWithPrice(
  productId: string,
  secretKey?: string
): Promise<ProductWithPrice> {
  const stripe = getStripeClient(secretKey);

  // Fetch the product
  const product = await stripe.products.retrieve(productId);

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  // Fetch the default price (or first active price)
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new Error(`No active price found for product ${productId}`);
  }

  const price = prices.data[0];

  // Calculate amount and format
  const amount = price.unit_amount || 0;
  const currency = price.currency.toUpperCase();
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);

  return {
    product,
    price,
    amount,
    currency,
    formattedAmount,
  };
}

