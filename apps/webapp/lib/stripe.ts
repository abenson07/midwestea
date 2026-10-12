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

/**
 * Create a Stripe customer using raw fetch (for Cloudflare Workers compatibility)
 * This bypasses the Stripe SDK's HTTP client which doesn't work in Workers
 */
export async function createStripeCustomerWithFetch(
  email: string,
  name: string,
  secretKey?: string
): Promise<{ id: string }> {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email,
      name,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(`Stripe API error: ${errorData.error?.message || errorData.message || `HTTP ${response.status}`}`);
  }

  const customer = await response.json();
  return { id: customer.id };
}

/**
 * Create a Stripe checkout session using raw fetch (for Cloudflare Workers compatibility)
 * This bypasses the Stripe SDK's HTTP client which doesn't work in Workers
 */
export async function createStripeCheckoutSessionWithFetch(
  customerId: string,
  lineItem: { productName: string; unitAmount: number; currency?: string },
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>,
  secretKey?: string
): Promise<{ id: string; url: string | null }> {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const params = new URLSearchParams({
    customer: customerId,
    'line_items[0][price_data][currency]': lineItem.currency || 'usd',
    'line_items[0][price_data][product_data][name]': lineItem.productName,
    'line_items[0][price_data][unit_amount]': String(lineItem.unitAmount),
    'line_items[0][quantity]': '1',
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Add metadata
  Object.entries(metadata).forEach(([key, value]) => {
    params.append(`metadata[${key}]`, value);
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(`Stripe API error: ${errorData.error?.message || errorData.message || `HTTP ${response.status}`}`);
  }

  const session = await response.json();
  return { id: session.id, url: session.url };
}

/**
 * Retrieve a Stripe checkout session using raw fetch (for Cloudflare Workers
 * compatibility). Used to resolve the paying customer's email/metadata
 * server-side after redirect, rather than trusting client-supplied query
 * params.
 */
export async function retrieveStripeCheckoutSessionWithFetch(
  sessionId: string,
  secretKey?: string
): Promise<{
  id: string;
  payment_status: string;
  customer_email: string | null;
  customer_details: { email: string | null } | null;
  metadata: Record<string, string> | null;
}> {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(`Stripe API error: ${errorData.error?.message || errorData.message || `HTTP ${response.status}`}`);
  }

  return response.json();
}

/**
 * Create a Stripe checkout session for an ad-hoc amount (not tied to a fixed
 * Stripe price id), using raw fetch for Cloudflare Workers compatibility.
 */
export async function createStripeCheckoutSessionForAmountWithFetch(
  customerId: string,
  amountCents: number,
  productName: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>,
  secretKey?: string
): Promise<{ id: string; url: string | null }> {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const params = new URLSearchParams({
    customer: customerId,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': productName,
    'line_items[0][price_data][unit_amount]': String(amountCents),
    'line_items[0][quantity]': '1',
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  Object.entries(metadata).forEach(([k, v]) => {
    params.append(`metadata[${k}]`, v);
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(`Stripe API error: ${errorData.error?.message || errorData.message || `HTTP ${response.status}`}`);
  }

  const session = await response.json();
  return { id: session.id, url: session.url };
}
