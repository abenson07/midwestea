import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, createStripeCustomerWithFetch, createStripeCheckoutSessionWithFetch } from '@/lib/stripe';
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
        { status: 500 }
      );
    }

    let stripe: Stripe;
    try {
      stripe = getStripeClient(stripeSecretKey);
    } catch (stripeError: any) {
      console.error('Error initializing Stripe client:', stripeError);
      return NextResponse.json(
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
          { status: 500 }
        );
      }
    } catch (supabaseError: any) {
      console.error('Error initializing Supabase client:', {
        error: supabaseError,
        message: supabaseError?.message,
        stack: supabaseError?.stack,
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { 
          error: `Database connection error: ${supabaseError?.message || 'Unknown error'}`,
          envCheck: {
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseServiceKey: !!supabaseServiceKey,
            supabaseUrlPrefix: supabaseUrl?.substring(0, 30) || 'missing'
          }
        },
        { status: 500 }
      );
    }

    // Fetch class from database to get stripe_price_id
    let classRecord;
    try {
      console.log(`Fetching class with class_id: ${classId}`);
      let { data, error: classError } = await supabase
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
        console.error('Supabase query error:', {
          error: classError,
          message: classError.message,
          code: classError.code,
          details: classError.details,
          hint: classError.hint
        });
        return NextResponse.json(
          { status: 404 }
        );
      }

      if (!data) {
        console.error(`No class record found for class_id: ${classId}`);
        return NextResponse.json(
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
        { status: 500 }
      );
    }

    if (!classRecord.stripe_price_id) {
      console.error(`Class ${classId} missing stripe_price_id`);
      return NextResponse.json(
        { status: 400 }
      );
    }

    // Create or find Stripe customer by email
    // WORKAROUND: In Cloudflare Workers, skip customer lookup and always create new customer
    // This avoids connection issues with Stripe API from Workers environment
    let customerId: string;
    try {
      
      // Skip customer lookup in Cloudflare Workers - just create new customer directly
      // Stripe will handle duplicate emails if needed, and this avoids connection issues
      
      console.log(`Creating Stripe customer for email: ${email} (using raw fetch for Workers compatibility)`);
      // Use raw fetch instead of Stripe SDK for Cloudflare Workers compatibility
      const customer = await Promise.race([
        createStripeCustomerWithFetch(email, fullName, stripeSecretKey),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Customer create timeout after 20s')), 20000))
      ]);
      
      customerId = customer.id;
      console.log(`Created Stripe customer: ${customerId}`);
      
      /* ORIGINAL CODE - COMMENTED OUT DUE TO CONNECTION ISSUES IN CLOUDFLARE WORKERS
      // Try to find existing customer first, but if connection fails, create new customer directly
      let customers;
      try {
        customers = await Promise.race([
          stripe.customers.list({
            email: email,
            limit: 1,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Customer list timeout after 15s')), 15000))
        ]);
      } catch (listError: any) {
        console.error('Stripe customer list error:', {
          message: listError?.message,
          type: listError?.type,
          code: listError?.code,
          statusCode: listError?.statusCode,
          requestId: listError?.requestId,
          stack: listError?.stack
        });
        // If listing fails due to connection error, skip lookup and create new customer
        if (listError?.type === 'StripeConnectionError' || listError?.message?.includes('connection') || listError?.message?.includes('timeout')) {
          console.warn('Stripe customer list failed, will create new customer:', listError.message);
          customers = { data: [] }; // Treat as no existing customer
        } else {
          throw listError; // Re-throw if it's a different error
        }
      }

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Found existing Stripe customer: ${customerId}`);
      } else {
        // This branch should not be reached with the new skip-lookup strategy
        throw new Error('Unexpected code path - customer lookup was skipped');
      }
      */
    } catch (stripeCustomerError: any) {
      console.error('Stripe customer error - FULL DETAILS:', {
        error: stripeCustomerError,
        message: stripeCustomerError?.message,
        type: stripeCustomerError?.type,
        code: stripeCustomerError?.code,
        statusCode: stripeCustomerError?.statusCode,
        requestId: stripeCustomerError?.requestId,
        headers: stripeCustomerError?.headers,
        stack: stripeCustomerError?.stack,
        cause: stripeCustomerError?.cause,
        allProperties: Object.keys(stripeCustomerError || {})
      });
      
      // Provide more helpful error message for connection errors
      let errorMessage = stripeCustomerError?.message || 'Unknown error';
      if (stripeCustomerError?.type === 'StripeConnectionError') {
        errorMessage = 'Unable to connect to Stripe. This may be a temporary network issue. Please try again in a moment.';
      }
      
      return NextResponse.json(
        { 
          error: `Failed to process customer information: ${errorMessage}. Please try again.`, 
          errorDetails: {
            type: stripeCustomerError?.type,
            code: stripeCustomerError?.code,
            statusCode: stripeCustomerError?.statusCode,
            requestId: stripeCustomerError?.requestId,
            isConnectionError: stripeCustomerError?.type === 'StripeConnectionError',
            isTimeout: stripeCustomerError?.message?.includes('timeout')
          }
        },
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
      console.log(`Creating Stripe checkout session for class ${classId} with price ${classRecord.stripe_price_id} (using raw fetch for Workers compatibility)`);
      // Success URL goes to base domain (no /app path) - this is the Webflow site
      const successUrl = `${origin}/purchase-confirmation/general`;
      console.log(`Success URL: ${successUrl}`);
      console.log(`Cancel URL: ${origin}${basePath}/checkout/details?classID=${classId}`);
      
      // Use raw fetch instead of Stripe SDK for Cloudflare Workers compatibility
      const sessionResult = await createStripeCheckoutSessionWithFetch(
        customerId,
        classRecord.stripe_price_id,
        successUrl,
        `${origin}${basePath}/checkout/details?classID=${classId}`,
        {
          full_name: fullName,
          class_id: classId,
        },
        stripeSecretKey
      );
      
      // Convert to format expected by rest of code
      session = { id: sessionResult.id, url: sessionResult.url };
      
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
        { status: 500 }
      );
    }

    if (!session.url) {
      console.error('Checkout session created but no URL returned');
      return NextResponse.json(
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
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}



