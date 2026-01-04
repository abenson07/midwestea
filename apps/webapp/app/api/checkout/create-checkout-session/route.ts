import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // #region agent log
  const debugInfo: any[] = [];
  debugInfo.push({step:'entry',location:'route.ts:6',data:{url:request.url,method:request.method}});
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:6',message:'POST handler entry',data:{url:request.url,method:request.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    let body;
    try {
      body = await request.json();
      // #region agent log
      debugInfo.push({step:'body_parsed',location:'route.ts:13',data:{hasEmail:!!body?.email,hasFullName:!!body?.fullName,hasClassId:!!body?.classId,classId:body?.classId}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:11',message:'Request body parsed',data:{hasEmail:!!body?.email,hasFullName:!!body?.fullName,hasClassId:!!body?.classId,classId:body?.classId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (parseError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:13',message:'JSON parse error',data:{error:parseError?.message,type:parseError?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    debugInfo.push({step:'env_check_stripe',location:'route.ts:52',data:{hasStripeKey:!!stripeSecretKey,stripeKeyPrefix:stripeSecretKey?.substring(0,7)||'none'}});
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:43',message:'Environment check - Stripe',data:{hasStripeKey:!!stripeSecretKey,stripeKeyPrefix:stripeSecretKey?.substring(0,7)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!stripeSecretKey) {
      // #region agent log
      debugInfo.push({step:'missing_stripe_key',location:'route.ts:57',data:{availableStripeVars:Object.keys(process.env).filter(k=>k.includes('STRIPE'))}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:46',message:'Missing STRIPE_SECRET_KEY',data:{availableStripeVars:Object.keys(process.env).filter(k=>k.includes('STRIPE'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('STRIPE_SECRET_KEY is not configured');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      return NextResponse.json(
        { error: 'Stripe secret key is not configured', debug: debugInfo },
        { status: 500 }
      );
    }

    // Check Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    // #region agent log
    debugInfo.push({step:'env_check_supabase',location:'route.ts:70',data:{hasUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,urlPrefix:supabaseUrl?.substring(0,20)||'none'}});
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:56',message:'Environment check - Supabase',data:{hasUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,urlPrefix:supabaseUrl?.substring(0,20)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!supabaseUrl || !supabaseServiceKey) {
      // #region agent log
      debugInfo.push({step:'missing_supabase_creds',location:'route.ts:76',data:{hasUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,availableSupabaseVars:Object.keys(process.env).filter(k=>k.includes('SUPABASE'))}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:59',message:'Missing Supabase credentials',data:{hasUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,availableSupabaseVars:Object.keys(process.env).filter(k=>k.includes('SUPABASE'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        availableEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      });
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.', debug: debugInfo },
        { status: 500 }
      );
    }

    let stripe: Stripe;
    try {
      // #region agent log
      debugInfo.push({step:'init_stripe',location:'route.ts:92'});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:72',message:'Initializing Stripe client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      stripe = getStripeClient(stripeSecretKey);
      // #region agent log
      debugInfo.push({step:'stripe_initialized',location:'route.ts:96'});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:74',message:'Stripe client initialized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (stripeError: any) {
      // #region agent log
      debugInfo.push({step:'stripe_init_error',location:'route.ts:100',data:{error:stripeError?.message,type:stripeError?.name}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:76',message:'Stripe client init error',data:{error:stripeError?.message,type:stripeError?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error initializing Stripe client:', stripeError);
      return NextResponse.json(
        { error: 'Payment service configuration error', debug: debugInfo },
        { status: 500 }
      );
    }

    let supabase;
    try {
      // #region agent log
      debugInfo.push({step:'init_supabase',location:'route.ts:103'});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:83',message:'Initializing Supabase client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      supabase = createSupabaseAdminClient();
      // #region agent log
      debugInfo.push({step:'supabase_created',location:'route.ts:106'});
      debugInfo.push({step:'test_supabase_connection',location:'route.ts:108'});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:85',message:'Testing Supabase connection',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Test the connection by making a simple query
      const { error: testError } = await supabase.from('classes').select('id').limit(1);
      if (testError) {
        // #region agent log
        debugInfo.push({step:'supabase_test_failed',location:'route.ts:110',data:{error:testError?.message,code:testError?.code}});
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:87',message:'Supabase connection test failed',data:{error:testError?.message,code:testError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Supabase connection test failed:', testError);
        return NextResponse.json(
          { error: `Database connection error: ${testError.message}`, debug: debugInfo },
          { status: 500 }
        );
      }
      // #region agent log
      debugInfo.push({step:'supabase_test_passed',location:'route.ts:115'});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:92',message:'Supabase connection test passed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } catch (supabaseError: any) {
      // #region agent log
      debugInfo.push({step:'supabase_init_error',location:'route.ts:150',data:{error:supabaseError?.message,type:supabaseError?.name,hasUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:94',message:'Supabase client init error',data:{error:supabaseError?.message,type:supabaseError?.name,stack:supabaseError?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
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
          debug: debugInfo,
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
      // #region agent log
      debugInfo.push({step:'query_class',location:'route.ts:125',data:{classId}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:108',message:'Querying class from database',data:{classId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log(`Fetching class with class_id: ${classId}`);
      const { data, error: classError } = await supabase
        .from('classes')
        .select('stripe_price_id, id, class_id')
        .eq('class_id', classId)
        .single();

      if (classError) {
        // #region agent log
        debugInfo.push({step:'class_query_error',location:'route.ts:132',data:{classId,error:classError?.message,code:classError?.code}});
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:115',message:'Class query error',data:{classId,error:classError?.message,code:classError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('Supabase query error:', {
          error: classError,
          message: classError.message,
          code: classError.code,
          details: classError.details,
          hint: classError.hint
        });
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}. Error: ${classError.message}`, debug: debugInfo },
          { status: 404 }
        );
      }

      if (!data) {
        // #region agent log
        debugInfo.push({step:'class_not_found',location:'route.ts:147',data:{classId}});
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:130',message:'Class not found - no data',data:{classId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error(`No class record found for class_id: ${classId}`);
        return NextResponse.json(
          { error: `Class not found with class_id: ${classId}`, debug: debugInfo },
          { status: 404 }
        );
      }

      // #region agent log
      debugInfo.push({step:'class_found',location:'route.ts:154',data:{classId,hasStripePriceId:!!data.stripe_price_id}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:137',message:'Class found',data:{classId,hasStripePriceId:!!data.stripe_price_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log(`Found class record:`, { id: data.id, class_id: data.class_id, has_stripe_price_id: !!data.stripe_price_id });
      classRecord = data;
    } catch (dbError: any) {
      // #region agent log
      debugInfo.push({step:'db_query_exception',location:'route.ts:157',data:{classId,error:dbError?.message,type:dbError?.name}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:139',message:'Database query exception',data:{classId,error:dbError?.message,type:dbError?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('Database query error:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        name: dbError?.name
      });
      return NextResponse.json(
        { error: `Failed to fetch class information: ${dbError?.message || 'Unknown error'}. Please try again.`, debug: debugInfo },
        { status: 500 }
      );
    }

    if (!classRecord.stripe_price_id) {
      debugInfo.push({step:'missing_stripe_price_id',location:'route.ts:233',data:{classId}});
      console.error(`Class ${classId} missing stripe_price_id`);
      return NextResponse.json(
        { error: `Class ${classId} does not have a stripe_price_id configured`, debug: debugInfo },
        { status: 400 }
      );
    }

    // Create or find Stripe customer by email
    // WORKAROUND: In Cloudflare Workers, skip customer lookup and always create new customer
    // This avoids connection issues with Stripe API from Workers environment
    let customerId: string;
    try {
      // #region agent log
      const lookupStartTime = Date.now();
      debugInfo.push({step:'customer_creation_start',location:'route.ts:253',data:{email,fullName,startTime:lookupStartTime,strategy:'create_new_skip_lookup'}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:163',message:'Creating Stripe customer (skipping lookup)',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Skip customer lookup in Cloudflare Workers - just create new customer directly
      // Stripe will handle duplicate emails if needed, and this avoids connection issues
      // #region agent log
      const createStartTime = Date.now();
      debugInfo.push({step:'creating_customer_direct',location:'route.ts:260',data:{email,fullName,startTime:createStartTime}});
      // #endregion
      
      console.log(`Creating Stripe customer for email: ${email} (skipping lookup to avoid connection issues)`);
      const customer = await Promise.race([
        stripe.customers.create({
          email: email,
          name: fullName,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Customer create timeout after 20s')), 20000))
      ]);
      
      customerId = customer.id;
      // #region agent log
      debugInfo.push({step:'customer_created',location:'route.ts:272',data:{customerId,duration:Date.now()-createStartTime}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:179',message:'Created Stripe customer',data:{customerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.log(`Created Stripe customer: ${customerId}`);
      
      /* ORIGINAL CODE - COMMENTED OUT DUE TO CONNECTION ISSUES IN CLOUDFLARE WORKERS
      // Try to find existing customer first, but if connection fails, create new customer directly
      let customers;
      try {
        // #region agent log
        const listStartTime = Date.now();
        debugInfo.push({step:'customer_list_start',location:'route.ts:270',data:{email,startTime:listStartTime}});
        // #endregion
        customers = await Promise.race([
          stripe.customers.list({
            email: email,
            limit: 1,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Customer list timeout after 15s')), 15000))
        ]);
        // #region agent log
        debugInfo.push({step:'customer_list_success',location:'route.ts:278',data:{count:customers?.data?.length||0,duration:Date.now()-listStartTime}});
        // #endregion
      } catch (listError: any) {
        // #region agent log
        debugInfo.push({step:'customer_list_failed',location:'route.ts:280',data:{
          error:listError?.message,
          type:listError?.type,
          code:listError?.code,
          statusCode:listError?.statusCode,
          requestId:listError?.requestId,
          isConnectionError:listError?.type === 'StripeConnectionError',
          isTimeout:listError?.message?.includes('timeout'),
          duration:Date.now() - (debugInfo[debugInfo.length - 1]?.data?.startTime || Date.now())
        }});
        // #endregion
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
        // #region agent log
        debugInfo.push({step:'found_existing_customer',location:'route.ts:260',data:{customerId}});
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:169',message:'Found existing Stripe customer',data:{customerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.log(`Found existing Stripe customer: ${customerId}`);
      } else {
        // This branch should not be reached with the new skip-lookup strategy
        throw new Error('Unexpected code path - customer lookup was skipped');
      }
      */
    } catch (stripeCustomerError: any) {
      // #region agent log
      debugInfo.push({step:'stripe_customer_error',location:'route.ts:325',data:{
        error:stripeCustomerError?.message,
        type:stripeCustomerError?.type,
        code:stripeCustomerError?.code,
        statusCode:stripeCustomerError?.statusCode,
        requestId:stripeCustomerError?.requestId,
        isConnectionError:stripeCustomerError?.type === 'StripeConnectionError',
        isTimeout:stripeCustomerError?.message?.includes('timeout'),
        headers:stripeCustomerError?.headers ? Object.keys(stripeCustomerError.headers) : null,
        rawError:JSON.stringify({
          name: stripeCustomerError?.name,
          message: stripeCustomerError?.message,
          type: stripeCustomerError?.type,
          code: stripeCustomerError?.code,
          statusCode: stripeCustomerError?.statusCode,
          requestId: stripeCustomerError?.requestId
        })
      }});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:181',message:'Stripe customer error',data:{error:stripeCustomerError?.message,type:stripeCustomerError?.type,code:stripeCustomerError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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
          debug: debugInfo,
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
      // #region agent log
      debugInfo.push({step:'creating_checkout_session',location:'route.ts:309',data:{classId,stripePriceId:classRecord.stripe_price_id,customerId,successUrl:`${origin}${basePath}/checkout/success`}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:208',message:'Creating Stripe checkout session',data:{classId,stripePriceId:classRecord.stripe_price_id,customerId,successUrl:`${origin}${basePath}/checkout/success`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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
      
      // #region agent log
      debugInfo.push({step:'checkout_session_created',location:'route.ts:337',data:{sessionId:session.id,hasUrl:!!session.url}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:229',message:'Checkout session created',data:{sessionId:session.id,hasUrl:!!session.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.log(`Checkout session created successfully: ${session.id}`);
    } catch (stripeSessionError: any) {
      // #region agent log
      debugInfo.push({step:'checkout_session_error',location:'route.ts:340',data:{error:stripeSessionError?.message,type:stripeSessionError?.type,code:stripeSessionError?.code,param:stripeSessionError?.param}});
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:231',message:'Stripe checkout session error',data:{error:stripeSessionError?.message,type:stripeSessionError?.type,code:stripeSessionError?.code,param:stripeSessionError?.param},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Stripe checkout session creation error:', {
        error: stripeSessionError,
        message: stripeSessionError?.message,
        type: stripeSessionError?.type,
        code: stripeSessionError?.code,
        statusCode: stripeSessionError?.statusCode,
        param: stripeSessionError?.param
      });
      return NextResponse.json(
        { error: `Failed to create checkout session: ${stripeSessionError?.message || 'Unknown error'}. Please try again.`, debug: debugInfo },
        { status: 500 }
      );
    }

    if (!session.url) {
      debugInfo.push({step:'no_session_url',location:'route.ts:352'});
      console.error('Checkout session created but no URL returned');
      return NextResponse.json(
        { error: 'Failed to generate checkout URL. Please try again.', debug: debugInfo },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    // #region agent log
    debugInfo.push({step:'catch_all_error',location:'route.ts:264',data:{error:error?.message,type:error?.name,code:error?.code}});
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-checkout-session/route.ts:257',message:'Unexpected error in catch-all',data:{error:error?.message,type:error?.name,code:error?.code,stack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
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
        debug: debugInfo
      },
      { status: 500 }
    );
  }
}



