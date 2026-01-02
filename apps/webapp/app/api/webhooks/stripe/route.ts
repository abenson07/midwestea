import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import {
  findOrCreateStudent,
  getOrCreateStripeCustomer,
  findClassByClassId,
  createEnrollment,
  createPayment,
} from '@/lib/enrollments';
import { insertLog } from '@/lib/logging';
import { createRegistrationFeeInvoices } from '@/lib/invoices';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:16',message:'Stripe webhook POST received',data:{hasSignature:!!request.headers.get('stripe-signature')},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Get the raw body as text - critical for Stripe signature verification
  // Read as ArrayBuffer first to ensure we get the exact raw bytes without any transformation
  const bodyBuffer = await request.arrayBuffer();
  // Convert to string using TextDecoder to preserve exact bytes
  const decoder = new TextDecoder('utf-8');
  const body = decoder.decode(bodyBuffer);
  const signature = request.headers.get('stripe-signature');

  // Debug logging
  console.log('[webhook] Body length:', body.length);
  console.log('[webhook] Body preview (first 100 chars):', body.substring(0, 100));
  console.log('[webhook] Has signature:', !!signature);
  console.log('[webhook] Content-Type:', request.headers.get('content-type'));

  if (!signature) {
    console.error('[webhook] Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error('[webhook] STRIPE_SECRET_KEY is not set');
    return NextResponse.json(
      { error: 'Stripe secret key not configured' },
      { status: 500 }
    );
  }

  // Log webhook secret info (first 10 chars only for security)
  console.log('[webhook] Webhook secret configured:', webhookSecret.substring(0, 10) + '...');
  console.log('[webhook] Signature header:', signature?.substring(0, 50) + '...');

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient(stripeSecretKey);
    // Important: body must be the raw string, signature must be from headers
    // If this fails, the body was likely modified before reaching this handler
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:50',message:'Event constructed successfully',data:{eventType:event.type,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:52',message:'Webhook signature verification failed',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[webhook] Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:60',message:'Webhook event received',data:{eventType:event.type,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Handle checkout.session.completed event (for payment links)
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:60',message:'Processing checkout.session.completed',data:{sessionId:session.id,paymentStatus:session.payment_status,metadata:session.metadata},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      console.log('[webhook] Processing checkout.session.completed:', session.id);

      // Extract classId from metadata first
      let classId = session.metadata?.classId;
      
      // If not in metadata, try to find it from the payment link
      // Retrieve the full session from Stripe to get payment_link field
      if (!classId) {
        console.log('[webhook] classId not in metadata, looking up from payment link');
        const supabase = createSupabaseAdminClient();
        const stripe = getStripeClient(stripeSecretKey);
        
        let paymentLinkIdentifier: string | null = null;
        
        try {
          // Retrieve the full session to get payment_link field (if created from payment link)
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_link']
          });
          
          // Check if session was created from a payment link
          if (fullSession.payment_link) {
            // payment_link can be a string (ID) or an object
            if (typeof fullSession.payment_link === 'string') {
              // If it's just an ID, we need to construct the URL or look it up differently
              // Payment link IDs are like: plink_xxx, but URLs are like: https://buy.stripe.com/xxx
              // We'll need to try matching by the payment link object's URL if available
              console.log('[webhook] Found payment_link ID:', fullSession.payment_link);
            } else {
              // If it's expanded, get the URL
              const paymentLinkObj = fullSession.payment_link as any;
              if (paymentLinkObj.url) {
                paymentLinkIdentifier = paymentLinkObj.url;
              }
            }
          }
        } catch (retrieveError) {
          console.warn('[webhook] Failed to retrieve full session:', retrieveError);
        }
        
        // Fallback: Try to extract from session URL if payment_link not found
        if (!paymentLinkIdentifier && session.url) {
          // Extract payment link ID from the checkout URL
          // Payment link URLs are like: https://buy.stripe.com/xxx
          const urlMatch = session.url.match(/buy\.stripe\.com\/([a-zA-Z0-9]+)/);
          if (urlMatch) {
            paymentLinkIdentifier = `https://buy.stripe.com/${urlMatch[1]}`;
          }
        }
        
        if (paymentLinkIdentifier) {
          console.log('[webhook] Looking up class by payment link:', paymentLinkIdentifier);
          
          // First try to find in classes table
          const { data: classData, error: classLookupError } = await supabase
            .from('classes')
            .select('class_id')
            .eq('stripe_payment_link', paymentLinkIdentifier)
            .maybeSingle();
          
          if (!classLookupError && classData?.class_id) {
            classId = classData.class_id;
            console.log('[webhook] Found classId from classes table:', classId);
          } else {
            // Fallback: try courses table (payment links might be stored there)
            console.log('[webhook] Not found in classes, trying courses table...');
            const { data: courseData, error: courseLookupError } = await supabase
              .from('courses')
              .select('course_code')
              .eq('stripe_payment_link', paymentLinkIdentifier)
              .maybeSingle();
            
            if (!courseLookupError && courseData?.course_code) {
              // If found in courses, we need to find a class with that course_code
              // For now, we'll use the course_code as a fallback identifier
              // But ideally we'd find a specific class - this is a limitation of the fallback approach
              console.warn('[webhook] Found course_code from courses table:', courseData.course_code);
              console.warn('[webhook] Note: Cannot determine specific classId from course_code alone. Consider adding metadata to payment links.');
            } else {
              console.warn('[webhook] Could not find payment link in classes or courses tables');
              console.warn('[webhook] Payment link searched:', paymentLinkIdentifier);
              console.warn('[webhook] This payment link does not exist in your database. Check that:');
              console.warn('[webhook] 1. The payment link URL matches exactly (including https://)');
              console.warn('[webhook] 2. The payment link is stored in the classes.stripe_payment_link column');
            }
          }
        } else {
          console.warn('[webhook] Could not extract payment link identifier from session');
          console.log('[webhook] Session URL:', session.url);
          console.log('[webhook] This is likely a Stripe CLI test event - test events do not have real payment links');
          console.log('[webhook] Real payments through your payment links (like https://buy.stripe.com/...) will have payment link URLs that match your database');
        }
      }
      
      if (!classId) {
        console.error('[webhook] Missing classId - not in metadata and could not find from payment link');
        console.log('[webhook] Session metadata:', JSON.stringify(session.metadata, null, 2));
        console.log('[webhook] Payment link:', (session as any).payment_link);
        console.log('[webhook] Session URL:', session.url);
        console.log('[webhook] Session ID:', session.id);
        
        // Check if this looks like a test event (no payment link)
        const isTestEvent = !(session as any).payment_link && !session.url?.includes('buy.stripe.com');
        const errorMessage = isTestEvent 
          ? 'Test event from Stripe CLI - no payment link available. Real payments through your payment links should work correctly.'
          : 'This webhook requires a classId. It should be in session metadata or the payment link should match a class in the database.';
        
        // For test events without metadata, return a more informative error
        return NextResponse.json(
          { 
            error: 'Missing classId in checkout session metadata',
            message: errorMessage,
            is_test_event: isTestEvent,
            session_id: session.id,
            payment_link: (session as any).payment_link || null,
            session_url: session.url || null,
            metadata: session.metadata || {}
          },
          { status: 400 }
        );
      }

      // Extract email from session
      const email = session.customer_email || session.customer_details?.email;
      if (!email) {
        console.error('[webhook] Could not extract email from checkout session');
        return NextResponse.json(
          { error: 'Could not extract email from checkout session' },
          { status: 400 }
        );
      }

      console.log('[webhook] Extracted email:', email, 'classId:', classId);

      // Step 1: Find or create student
      const student = await findOrCreateStudent(email);
      console.log('[webhook] Student found/created:', student.id);

      // Step 2: Get or create Stripe customer (if customer ID exists)
      if (session.customer) {
        await getOrCreateStripeCustomer(student, email, undefined);
      }
      console.log('[webhook] Stripe customer ensured for student:', student.id);

      // Step 3: Find class by class_id
      const classRecord = await findClassByClassId(classId);
      console.log('[webhook] Class found:', classRecord.id, 'class_id:', classRecord.class_id);

      // Step 4: Create enrollment
      const enrollment = await createEnrollment(student.id, classRecord.id);
      console.log('[webhook] Enrollment created/found:', enrollment.id);

      // Step 5: Create payment record
      // For checkout sessions, we need to get the payment intent
      let paymentIntentId: string | null = null;
      let amountCents = session.amount_total || 0;
      let receiptUrl: string | null = null;
      
      if (session.payment_intent) {
        paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
        
        // Retrieve payment intent to get amount and receipt
        const stripe = getStripeClient(stripeSecretKey);
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          amountCents = paymentIntent.amount;
          
          // Get receipt URL from charge if available
          if (paymentIntent.latest_charge) {
            const chargeId = typeof paymentIntent.latest_charge === 'string' 
              ? paymentIntent.latest_charge 
              : paymentIntent.latest_charge.id;
            const charge = await stripe.charges.retrieve(chargeId);
            receiptUrl = charge.receipt_url || null;
          }
        } catch (err) {
          console.warn('[webhook] Failed to retrieve payment intent:', err);
        }
      }

      // Create payment record directly (bypassing createPayment which expects PaymentIntent)
      const supabase = createSupabaseAdminClient();
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          enrollment_id: enrollment.id,
          amount_cents: amountCents,
          stripe_payment_intent_id: paymentIntentId || session.id,
          stripe_receipt_url: receiptUrl,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error(`Failed to create payment: ${paymentError.message}`);
      }

      if (!payment) {
        throw new Error('Failed to create payment: no data returned');
      }

      console.log('[webhook] Payment created:', payment.id);

      // Step 6: Log student registration
      try {
        await insertLog({
          admin_user_id: null,
          reference_id: classRecord.id,
          reference_type: 'class',
          action_type: 'student_registered',
          student_id: student.id,
          class_id: classRecord.id,
        });
      } catch (logError: any) {
        console.error('[webhook] Failed to log student registration:', logError);
      }

      // Step 7: Log payment success
      try {
        await insertLog({
          admin_user_id: null,
          reference_id: classRecord.id,
          reference_type: 'class',
          action_type: 'payment_success',
          student_id: student.id,
          class_id: classRecord.id,
          amount: amountCents,
        });
      } catch (logError: any) {
        console.error('[webhook] Failed to log payment success:', logError);
      }

      // Step 8: Create invoice record for CSV export on successful payment
      let invoiceErrorDetails: any = null;
      try {
        const paymentDate = new Date();
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:163',message:'About to call createRegistrationFeeInvoices (checkout.session)',data:{paymentId:payment.id,classId:classRecord.id,classIdText:classRecord.class_id,email,paymentDate:paymentDate.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('[webhook] Creating invoice record for payment:', payment.id);
        console.log('[webhook] Class details:', {
          id: classRecord.id,
          class_id: classRecord.class_id,
          class_name: classRecord.class_name,
          course_code: classRecord.course_code,
          price: classRecord.price,
          registration_fee: classRecord.registration_fee,
        });
        const invoices = await createRegistrationFeeInvoices(
          payment.id,
          classRecord,
          email,
          paymentDate
        );
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:172',message:'createRegistrationFeeInvoices returned successfully (checkout.session)',data:{invoiceCount:invoices.length,invoiceNumbers:invoices.map(i=>i.invoice_number)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('[webhook] Successfully created invoice records for CSV export:', invoices.length, 'invoices');
        console.log('[webhook] Invoice numbers:', invoices.map(i => i.invoice_number));
      } catch (invoiceError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:175',message:'createRegistrationFeeInvoices threw error (checkout.session)',data:{error:invoiceError.message,errorStack:invoiceError.stack,classId:classRecord.class_id,paymentId:payment.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        invoiceErrorDetails = {
          error: invoiceError.message,
          stack: invoiceError.stack,
          code: invoiceError.code,
          details: invoiceError.details,
          hint: invoiceError.hint,
          classId: classRecord.class_id,
          paymentId: payment.id,
        };
        console.error('[webhook] Failed to create invoice records:', invoiceErrorDetails);
        // Log the full error object for debugging
        console.error('[webhook] Full invoice error:', JSON.stringify(invoiceErrorDetails, null, 2));
        // Don't fail the webhook if invoice creation fails, but include error in response
      }

      return NextResponse.json({
        success: true,
        student_id: student.id,
        enrollment_id: enrollment.id,
        payment_id: payment.id,
        class_id: classRecord.id,
        invoice_error: invoiceErrorDetails ? {
          message: invoiceErrorDetails.error,
          code: invoiceErrorDetails.code,
          details: invoiceErrorDetails.details,
        } : null,
      });
    } catch (error: any) {
      console.error('[webhook] Error processing checkout.session.completed:', {
        error: error.message,
        stack: error.stack,
        session_id: (event.data.object as Stripe.Checkout.Session).id,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to process webhook',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }

  // Handle payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('[webhook] Processing payment_intent.succeeded (TEST MODE):', paymentIntent.id);
      console.log('[webhook] Payment intent amount:', paymentIntent.amount);
      console.log('[webhook] Payment intent metadata:', paymentIntent.metadata);

      // Get Supabase client
      const supabase = createSupabaseAdminClient();

      // Get the next invoice number
      const { data: maxInvoice, error: maxError } = await supabase
        .from('invoices_to_import')
        .select('invoice_number')
        .order('invoice_number', { ascending: false })
        .limit(1)
        .single();

      let nextInvoiceNumber = 100001;
      if (!maxError && maxInvoice?.invoice_number) {
        nextInvoiceNumber = maxInvoice.invoice_number + 1;
      }

      console.log('[webhook] Next invoice number:', nextInvoiceNumber);

      // Extract email from payment intent (or use test email)
      let email = paymentIntent.receipt_email || 
                  paymentIntent.metadata?.email || 
                  'test@example.com';

      // Extract amount (or use test amount)
      const amountCents = paymentIntent.amount || 10000; // Default to $100.00

      // Create test invoice data
      const paymentDate = new Date();
      const invoiceDate = paymentDate.toISOString().split('T')[0];
      const dueDate = new Date(paymentDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const testInvoice = {
        invoice_number: nextInvoiceNumber,
        customer_email: email,
        invoice_date: invoiceDate,
        due_date: dueDateStr,
        item: paymentIntent.metadata?.classId 
          ? `TEST:${paymentIntent.metadata.classId}:registration`
          : 'TEST:registration',
        memo: `Test invoice from payment intent ${paymentIntent.id}`,
        item_amount: amountCents,
        item_quantity: 1,
        item_rate: 0.5,
        payment_id: null, // Can be null for test
        class_id: null, // Can be null for test
        invoice_sequence: 1,
        category: paymentIntent.metadata?.courseCode || null,
        subcategory: paymentIntent.metadata?.classId || null,
      };

      console.log('[webhook] Inserting test invoice:', testInvoice);

      // Insert into invoices_to_import table
      const { data: insertedInvoice, error: insertError } = await supabase
        .from('invoices_to_import')
        .insert([testInvoice])
        .select()
        .single();

      if (insertError) {
        console.error('[webhook] Failed to insert invoice:', {
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw new Error(`Failed to insert invoice: ${insertError.message} (code: ${insertError.code})`);
      }

      console.log('[webhook] ✅ Successfully inserted test invoice:', {
        id: insertedInvoice.id,
        invoice_number: insertedInvoice.invoice_number,
        customer_email: insertedInvoice.customer_email,
      });

      return NextResponse.json({
        success: true,
        message: 'Test invoice created successfully',
        invoice: {
          id: insertedInvoice.id,
          invoice_number: insertedInvoice.invoice_number,
          customer_email: insertedInvoice.customer_email,
        },
        payment_intent_id: paymentIntent.id,
      });
    } catch (error: any) {
      console.error('[webhook] Error processing payment_intent.succeeded:', {
        error: error.message,
        stack: error.stack,
        payment_intent_id: (event.data.object as Stripe.PaymentIntent).id,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to process webhook',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }

  // Return success for other event types (we only handle payment_intent.succeeded)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:208',message:'Unhandled event type',data:{eventType:event.type,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[webhook] Received unhandled event type:', event.type);
  return NextResponse.json({ received: true });
}


