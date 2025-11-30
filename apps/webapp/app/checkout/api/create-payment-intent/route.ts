import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, getProductWithPrice } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get Stripe secret key from environment
    // In Cloudflare, this comes from env bindings
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured' },
        { status: 500 }
      );
    }

    // Fetch product and price details
    const { product, price, amount, currency, formattedAmount } = 
      await getProductWithPrice(productId, stripeSecretKey);

    // Create payment intent
    const stripe = getStripeClient(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        productId: product.id,
        productName: product.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
      },
      price: {
        id: price.id,
        amount,
        currency,
        formattedAmount,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

