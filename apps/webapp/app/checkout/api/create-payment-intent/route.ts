import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, getProductWithPrice } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, classId } = body;

    // Validate product ID format
    if (!productId) {
      console.error('[create-payment-intent] Missing productId in request body');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!classId) {
      console.error('[create-payment-intent] Missing classId in request body');
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Validate product ID format (Stripe product IDs start with 'prod_')
    if (typeof productId !== 'string' || !productId.startsWith('prod_')) {
      console.error('[create-payment-intent] Invalid product ID format:', productId);
      return NextResponse.json(
        { error: 'Invalid product ID format. Product ID must start with "prod_"' },
        { status: 400 }
      );
    }

    // Get Stripe secret key from environment
    // In Cloudflare, this comes from env bindings
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.error('[create-payment-intent] STRIPE_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { 
          error: 'Stripe secret key is not configured',
          details: 'The STRIPE_SECRET_KEY environment variable must be set in your deployment environment'
        },
        { status: 500 }
      );
    }

    // Validate that the key looks like a Stripe key (starts with sk_)
    if (!stripeSecretKey.startsWith('sk_')) {
      console.error('[create-payment-intent] Invalid Stripe secret key format');
      return NextResponse.json(
        { 
          error: 'Invalid Stripe secret key format',
          details: 'The STRIPE_SECRET_KEY must be a valid Stripe secret key starting with "sk_"'
        },
        { status: 500 }
      );
    }

    console.log('[create-payment-intent] Fetching product and price for productId:', productId);

    // Fetch product and price details
    let product, price, amount, currency, formattedAmount;
    try {
      const result = await getProductWithPrice(productId, stripeSecretKey);
      product = result.product;
      price = result.price;
      amount = result.amount;
      currency = result.currency;
      formattedAmount = result.formattedAmount;
      console.log('[create-payment-intent] Successfully fetched product:', product.id, 'price:', price.id);
    } catch (productError: any) {
      console.error('[create-payment-intent] Error fetching product/price:', {
        productId,
        error: productError.message,
        type: productError.type,
        code: productError.code,
      });
      
      // Handle specific Stripe errors
      if (productError.type === 'StripeInvalidRequestError') {
        if (productError.code === 'resource_missing') {
          return NextResponse.json(
            { 
              error: 'Product not found',
              details: `The product with ID ${productId} does not exist in your Stripe account`
            },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { 
            error: 'Invalid product request',
            details: productError.message || 'The product ID provided is invalid'
          },
          { status: 400 }
        );
      }
      
      // Re-throw to be caught by outer catch
      throw productError;
    }

    // Create payment intent
    console.log('[create-payment-intent] Creating payment intent for amount:', amount, currency);
    let paymentIntent;
    try {
      const stripe = getStripeClient(stripeSecretKey);
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        metadata: {
          productId: product.id,
          productName: product.name,
          classId: classId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      console.log('[create-payment-intent] Successfully created payment intent:', paymentIntent.id);
    } catch (paymentError: any) {
      console.error('[create-payment-intent] Error creating payment intent:', {
        error: paymentError.message,
        type: paymentError.type,
        code: paymentError.code,
        amount,
        currency,
      });
      
      // Handle specific Stripe payment intent errors
      if (paymentError.type === 'StripeInvalidRequestError') {
        if (paymentError.code === 'parameter_invalid_empty') {
          return NextResponse.json(
            { 
              error: 'Invalid payment amount',
              details: 'The product price is invalid or zero'
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { 
            error: 'Failed to create payment intent',
            details: paymentError.message || 'An error occurred while creating the payment intent'
          },
          { status: 400 }
        );
      }
      
      // Re-throw to be caught by outer catch
      throw paymentError;
    }

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
    // Catch-all for any unexpected errors
    console.error('[create-payment-intent] Unexpected error:', {
      error: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
      name: error.name,
    });
    
    // Determine appropriate error message and status
    let errorMessage = 'Failed to create payment intent';
    let errorDetails = error.message || 'An unexpected error occurred';
    let statusCode = 500;
    
    // Handle network/connection errors
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Connection to Stripe failed';
      errorDetails = 'Unable to connect to Stripe. Please check your internet connection and try again.';
      statusCode = 503;
    }
    // Handle Stripe API errors
    else if (error.type && error.type.startsWith('Stripe')) {
      errorMessage = 'Stripe API error';
      errorDetails = error.message || 'An error occurred with the Stripe API';
      statusCode = error.statusCode || 500;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

