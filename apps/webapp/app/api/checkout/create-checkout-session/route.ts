import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }

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
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
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
        hasServiceKey: !!supabaseServiceKey,
        availableEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
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
      // Test the connection by making a simple query
      const { error: testError } = await supabase.from('classes').select('id').limit(1);
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        return NextResponse.json(
          { error: `Database connection error: ${testError.message}` },
          { status: 500 }
        );
      }
    } catch (supabaseError: any) {
      console.error('Error initializing Supabase client:', {
        error: supabaseError,
        message: supabaseError?.message,
        stack: supabaseError?.stack
      });
      return NextResponse.json(
        { error: `Database connection error: ${supabaseError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Fetch class from database to get stripe_price_id
    let classRecord;
    try {
      console.log(`Fetching class with class_id: ${classId}`);
      const { data, error: classError } = await supabase
        .from('classes')
        .select('stripe_price_id, id, class_id')
        .eq('class_id', classId)
        .single();

      if (classError) {
        console.error('Supabase query error:', {
          error: classError,
          message: classError.message,
          code: classError.code,
          details: classError.details,
          hint: classError.hint
        });
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}. Error: ${classError.message}` },
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

      console.log(`Found class record:`, { id: data.id, class_id: data.class_id, has_stripe_price_id: !!data.stripe_price_id });
      classRecord = data;
    } catch (dbError: any) {
      console.error('Database query error:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        name: dbError?.name
      });
      return NextResponse.json(
        { error: `Failed to fetch class information: ${dbError?.message || 'Unknown error'}. Please try again.` },
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
        console.log(`Found existing Stripe customer: ${customerId}`);
      } else {
        // Create new customer
        console.log(`Creating new Stripe customer for email: ${email}`);
        const customer = await stripe.customers.create({
          email: email,
          name: fullName,
        });
        customerId = customer.id;
        console.log(`Created Stripe customer: ${customerId}`);
      }
    } catch (stripeCustomerError: any) {
      console.error('Stripe customer error:', {
        error: stripeCustomerError,
        message: stripeCustomerError?.message,
        type: stripeCustomerError?.type,
        code: stripeCustomerError?.code,
        statusCode: stripeCustomerError?.statusCode
      });
      return NextResponse.json(
        { error: `Failed to process customer information: ${stripeCustomerError?.message || 'Unknown error'}. Please try again.` },
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
      console.log(`Creating Stripe checkout session for class ${classId} with price ${classRecord.stripe_price_id}`);
      console.log(`Success URL: ${origin}${basePath}/checkout/success`);
      console.log(`Cancel URL: ${origin}${basePath}/checkout/details?classID=${classId}`);
      
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
      
      console.log(`Checkout session created successfully: ${session.id}`);
    } catch (stripeSessionError: any) {
      console.error('Stripe checkout session creation error:', {
        error: stripeSessionError,
        message: stripeSessionError?.message,
        type: stripeSessionError?.type,
        code: stripeSessionError?.code,
        statusCode: stripeSessionError?.statusCode,
        param: stripeSessionError?.param
      });
      return NextResponse.json(
        { error: `Failed to create checkout session: ${stripeSessionError?.message || 'Unknown error'}. Please try again.` },
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
    console.error('Unexpected error creating checkout session:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      type: error?.type,
      code: error?.code
    });
    return NextResponse.json(
      { 
        error: error?.message || 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}



