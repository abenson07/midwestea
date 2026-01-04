import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, classId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe secret key is not configured' },
        { status: 500 }
      );
    }

    // Check Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    let stripe: Stripe;
    try {
      stripe = getStripeClient(stripeSecretKey);
    } catch (stripeError: any) {
      console.error('Error initializing Stripe client:', stripeError);
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    let supabase;
    try {
      supabase = createSupabaseAdminClient();
    } catch (supabaseError: any) {
      console.error('Error initializing Supabase client:', supabaseError);
      return NextResponse.json(
        { error: 'Database connection error. Please contact support.' },
        { status: 500 }
      );
    }

    // Fetch class from database to get stripe_price_id
    let classRecord;
    try {
      const { data, error: classError } = await supabase
        .from('classes')
        .select('stripe_price_id, id')
        .eq('class_id', classId)
        .single();

      if (classError) {
        console.error('Supabase query error:', classError);
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}` },
          { status: 404 }
        );
      }

      if (!data) {
        console.error(`No class record found for class_id: ${classId}`);
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}` },
          { status: 404 }
        );
      }

      classRecord = data;
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch class information. Please try again.' },
        { status: 500 }
      );
    }

    if (!classRecord.stripe_price_id) {
      console.error(`Class ${classId} missing stripe_price_id`);
      return NextResponse.json(
        { error: `Class ${classId} does not have a stripe_price_id configured` },
        { status: 400 }
      );
    }

    // Create or find Stripe customer by email
    let customerId: string;
    try {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: email,
          name: fullName,
        });
        customerId = customer.id;
      }
    } catch (stripeCustomerError: any) {
      console.error('Stripe customer error:', stripeCustomerError);
      return NextResponse.json(
        { error: 'Failed to process customer information. Please try again.' },
        { status: 500 }
      );
    }

    // Determine base path for redirect URLs
    const origin = request.headers.get('origin') || 
                   request.nextUrl.origin ||
                   (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    // Determine base path - check the full URL to see if it includes /app
    // Next.js strips basePath from pathname, but we can check the full URL
    const fullUrl = request.url;
    const basePath = fullUrl.includes('/app/api') ? '/app' : '';

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: classRecord.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          full_name: fullName,
          class_id: classId,
        },
        success_url: `${origin}${basePath}/checkout/success`,
        cancel_url: `${origin}${basePath}/checkout/details?classID=${classId}`,
      });
    } catch (stripeSessionError: any) {
      console.error('Stripe checkout session creation error:', stripeSessionError);
      return NextResponse.json(
        { error: stripeSessionError.message || 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      );
    }

    if (!session.url) {
      console.error('Checkout session created but no URL returned');
      return NextResponse.json(
        { error: 'Failed to generate checkout URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    console.error('Unexpected error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}



