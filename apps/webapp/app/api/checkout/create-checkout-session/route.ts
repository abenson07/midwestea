import { NextRequest, NextResponse } from 'next/server';
import {
  getStripeClient,
  createStripeCustomerWithFetch,
  createStripeCheckoutSessionWithFetch,
} from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError: unknown) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }

    const { email, fullName, classId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe secret key is not configured' },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    let stripe: Stripe;
    try {
      stripe = getStripeClient(stripeSecretKey);
    } catch (stripeError: unknown) {
      console.error('Error initializing Stripe client:', stripeError);
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    let supabase;
    try {
      supabase = createSupabaseAdminClient();
      const { error: testError } = await supabase.from('classes').select('id').limit(1);
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        return NextResponse.json(
          { error: `Database connection error: ${testError.message}` },
          { status: 500 }
        );
      }
    } catch (supabaseError: unknown) {
      const message =
        supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
      console.error('Error initializing Supabase client:', supabaseError);
      return NextResponse.json(
        { error: `Database connection error: ${message}` },
        { status: 500 }
      );
    }

    let classRecord;
    try {
      const { data, error: classError } = await supabase
        .from('classes')
        .select('stripe_price_id, id, class_id')
        .eq('class_id', classId)
        .maybeSingle();

      if (!data && !classError) {
        const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
          .from('classes')
          .select('stripe_price_id, id, class_id')
          .ilike('class_id', classId)
          .maybeSingle();

        data = caseInsensitiveData;
        classError = caseInsensitiveError;
      }

      if (classError) {
        console.error('Supabase query error:', classError);
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}. Error: ${classError.message}` },
          { status: 404 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}` },
          { status: 404 }
        );
      }

      classRecord = data;
    } catch (dbError: unknown) {
      const message = dbError instanceof Error ? dbError.message : 'Unknown error';
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: `Failed to fetch class information: ${message}. Please try again.` },
        { status: 500 }
      );
    }

    if (!classRecord.stripe_price_id) {
      return NextResponse.json(
        { error: `Class ${classId} does not have a stripe_price_id configured` },
        { status: 400 }
      );
    }

    let customerId: string;
    try {
      const customer = await Promise.race([
        createStripeCustomerWithFetch(email, fullName, stripeSecretKey),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Customer create timeout after 20s')), 20000)
        ),
      ]);
      customerId = customer.id;
    } catch (stripeCustomerError: unknown) {
      const err = stripeCustomerError as { message?: string; type?: string };
      let errorMessage = err?.message || 'Unknown error';
      if (err?.type === 'StripeConnectionError') {
        errorMessage =
          'Unable to connect to Stripe. This may be a temporary network issue. Please try again in a moment.';
      }
      console.error('Stripe customer error:', stripeCustomerError);
      return NextResponse.json(
        { error: `Failed to process customer information: ${errorMessage}. Please try again.` },
        { status: 500 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000';

    let session;
    try {
      const successUrl = `${origin}/purchase-confirmation/general`;
      const cancelUrl = `${origin}/checkout/details?classID=${classId}`;

      const sessionResult = await createStripeCheckoutSessionWithFetch(
        customerId,
        classRecord.stripe_price_id,
        successUrl,
        cancelUrl,
        {
          full_name: fullName,
          class_id: classId,
        },
        stripeSecretKey
      );

      session = { id: sessionResult.id, url: sessionResult.url };
    } catch (stripeSessionError: unknown) {
      const message =
        stripeSessionError instanceof Error ? stripeSessionError.message : 'Unknown error';
      console.error('Stripe checkout session creation error:', stripeSessionError);
      return NextResponse.json(
        { error: `Failed to create checkout session: ${message}. Please try again.` },
        { status: 500 }
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to generate checkout URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Unexpected error creating checkout session:', error);
    return NextResponse.json(
      {
        error: `${message} Please try again.`,
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
