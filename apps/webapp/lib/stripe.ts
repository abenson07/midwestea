import Stripe from 'stripe';

// Server-side Stripe client
export function getStripeClient(secretKey?: string): Stripe {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  // Enhanced configuration for Cloudflare Workers environment
  return new Stripe(key, {
    typescript: true,
    timeout: 30000, // 30 second timeout
    maxNetworkRetries: 3, // Retry up to 3 times on network errors
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
  if (!productId || typeof productId !== 'string') {
    throw new Error('Product ID is required and must be a string');
  }

  if (!productId.startsWith('prod_')) {
    throw new Error(`Invalid product ID format: ${productId}. Product IDs must start with "prod_"`);
  }

  const stripe = getStripeClient(secretKey);

  // Fetch the product with error handling
  let product: Stripe.Product;
  try {
    product = await stripe.products.retrieve(productId);
  } catch (error: any) {
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        throw new Error(`Product ${productId} not found in Stripe`);
      }
      throw new Error(`Stripe API error: ${error.message || 'Invalid product request'}`);
    }
    
    // Handle network/connection errors
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      throw new Error(`Failed to connect to Stripe API: ${error.message}`);
    }
    
    // Re-throw with context
    throw new Error(`Error retrieving product ${productId}: ${error.message || 'Unknown error'}`);
  }

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  // Fetch the default price (or first active price) with error handling
  let prices: Stripe.ApiList<Stripe.Price>;
  try {
    prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });
  } catch (error: any) {
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      throw new Error(`Stripe API error while fetching prices: ${error.message || 'Invalid price request'}`);
    }
    
    // Handle network/connection errors
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      throw new Error(`Failed to connect to Stripe API while fetching prices: ${error.message}`);
    }
    
    // Re-throw with context
    throw new Error(`Error retrieving prices for product ${productId}: ${error.message || 'Unknown error'}`);
  }

  if (prices.data.length === 0) {
    throw new Error(`No active price found for product ${productId}. Please ensure the product has at least one active price in Stripe.`);
  }

  const price = prices.data[0];

  // Validate price data
  if (!price.unit_amount && price.unit_amount !== 0) {
    throw new Error(`Price ${price.id} for product ${productId} has no unit_amount set`);
  }

  if (!price.currency) {
    throw new Error(`Price ${price.id} for product ${productId} has no currency set`);
  }

  // Calculate amount and format
  const amount = price.unit_amount || 0;
  const currency = price.currency.toUpperCase();
  
  // Validate amount is greater than 0
  if (amount <= 0) {
    throw new Error(`Price ${price.id} for product ${productId} has an invalid amount: ${amount}. Amount must be greater than 0.`);
  }

  let formattedAmount: string;
  try {
    formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  } catch (formatError: any) {
    // Fallback formatting if Intl.NumberFormat fails
    formattedAmount = `${currency} ${(amount / 100).toFixed(2)}`;
  }

  return {
    product,
    price,
    amount,
    currency,
    formattedAmount,
  };
}

