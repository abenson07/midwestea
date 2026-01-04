import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * Query the last Stripe payment intent transaction
 * GET /api/test-stripe-query
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[test-stripe-query] Querying Stripe for last payment intent...');
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'STRIPE_SECRET_KEY is not set',
        },
        { status: 500 }
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    console.log('[test-stripe-query] Stripe client created');

    // Query for the most recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10, // Get last 10
    });

    if (!paymentIntents.data || paymentIntents.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No payment intents found',
        count: 0,
        paymentIntents: [],
      });
    }

    const lastPaymentIntent = paymentIntents.data[0];
    console.log('[test-stripe-query] ✅ Found payment intents:', {
      total: paymentIntents.data.length,
      lastPaymentIntentId: lastPaymentIntent.id,
      lastAmount: lastPaymentIntent.amount,
      lastStatus: lastPaymentIntent.status,
    });

    // Get full details of the last payment intent
    const fullPaymentIntent = await stripe.paymentIntents.retrieve(lastPaymentIntent.id);

    return NextResponse.json({
      success: true,
      message: `Found ${paymentIntents.data.length} payment intent(s)`,
      count: paymentIntents.data.length,
      lastPaymentIntent: {
        id: fullPaymentIntent.id,
        amount: fullPaymentIntent.amount,
        currency: fullPaymentIntent.currency,
        status: fullPaymentIntent.status,
        customer: fullPaymentIntent.customer,
        receipt_email: fullPaymentIntent.receipt_email,
        metadata: fullPaymentIntent.metadata,
        created: fullPaymentIntent.created,
        description: fullPaymentIntent.description,
        payment_method: fullPaymentIntent.payment_method,
        latest_charge: fullPaymentIntent.latest_charge,
      },
      // Also return summary of recent payment intents
      recentPaymentIntents: paymentIntents.data.map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        metadata: pi.metadata,
        receipt_email: pi.receipt_email,
      })),
    });
  } catch (error: any) {
    console.error('[test-stripe-query] Unexpected error:', {
      error: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        code: error.code,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}



