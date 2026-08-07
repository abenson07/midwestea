import { NextRequest, NextResponse } from 'next/server';
import { retrieveStripeCheckoutSessionWithFetch } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Resolves the paying student's email and class id from a Stripe Checkout
 * Session id, server-side. Used by /checkout/success instead of trusting a
 * client-editable ?email= query param -- the session id itself is generated
 * by Stripe and substituted into the redirect URL, so it can't be forged
 * into someone else's payment. Only the minimal safe fields are returned;
 * the full Stripe session object (customer id, payment_intent, etc.) is
 * never exposed to the client.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    let session;
    try {
      session = await retrieveStripeCheckoutSessionWithFetch(sessionId, stripeSecretKey);
    } catch (stripeError: unknown) {
      const message = stripeError instanceof Error ? stripeError.message : 'Unknown error';
      console.error('Failed to retrieve checkout session:', stripeError);
      return NextResponse.json(
        { error: `Failed to retrieve checkout session: ${message}` },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const email = session.customer_email || session.customer_details?.email || null;
    const classId = session.metadata?.class_id || null;

    if (!email || !classId) {
      console.error('Checkout session missing expected data:', { email, classId, sessionId });
      return NextResponse.json({ error: 'Incomplete session data' }, { status: 500 });
    }

    return NextResponse.json({ email, classId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Unexpected error resolving checkout session:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
