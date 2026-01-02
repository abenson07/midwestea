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
      
      console.log('[webhook] Processing checkout.session.completed:', session.id);

      // Extract email from session
      const email = session.customer_email || session.customer_details?.email;
      if (!email) {
        console.error('[webhook] Could not extract email from checkout session');
        return NextResponse.json(
          { error: 'Could not extract email from checkout session' },
          { status: 400 }
        );
      }

      console.log('[webhook] Extracted email:', email);

      // Step 1: Find or create student
      const student = await findOrCreateStudent(email);
      console.log('[webhook] Student found/created:', student.id);

      // Step 2: Get payment details
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

      // Step 3: Get payment link info for later processing
      let paymentLinkId: string | null = null;
      let paymentLinkUrl: string | null = null;
      try {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['payment_link', 'line_items']
        });
        
        if (fullSession.payment_link) {
          if (typeof fullSession.payment_link === 'string') {
            paymentLinkId = fullSession.payment_link;
            try {
              const paymentLinkObj = await stripe.paymentLinks.retrieve(paymentLinkId);
              paymentLinkUrl = paymentLinkObj.url || null;
            } catch (err) {
              console.warn('[webhook] Failed to retrieve payment link URL:', err);
            }
          } else {
            paymentLinkId = (fullSession.payment_link as any).id;
            paymentLinkUrl = (fullSession.payment_link as any).url || null;
          }
        }
      } catch (err) {
        console.warn('[webhook] Failed to retrieve payment link info:', err);
      }

      // Step 4: Create a minimal enrollment (required for payments table)
      // We'll create a placeholder enrollment that can be updated later by follow-up scripts
      const supabase = createSupabaseAdminClient();
      
      // Create a temporary enrollment record (we'll need a class_id, so use a placeholder)
      // For now, we'll need to handle this - but let's try to find/create a minimal enrollment
      // Actually, we need enrollment_id which requires a class. Let's create a dummy enrollment.
      // But wait - we need a class_id for enrollment. Let's store payment data and handle enrollment later.
      
      // Actually, let's just create the payment with a placeholder enrollment
      // We'll need to modify the approach - create enrollment with a placeholder class or make enrollment_id nullable
      
      // For now, let's create a minimal enrollment record
      // We'll need to get or create a placeholder class, or make enrollment_id nullable
      
      // Simplest: Create enrollment with a placeholder/dummy class
      // But that's messy. Let's check if we can make enrollment_id nullable first.
      
      // Actually, the user wants to just create payments. Let's create a payment record
      // We'll need enrollment_id, so we'll create a minimal enrollment.
      // But we need a class_id for enrollment. This is getting complex.
      
      // Let me simplify: Create payment with enrollment_id pointing to a placeholder enrollment
      // We'll create the enrollment with minimal data that can be updated later
      
      // Get or create a placeholder class for "unassigned" payments
      const { data: placeholderClass, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('class_id', 'UNASSIGNED')
        .maybeSingle();
      
      let classIdForEnrollment: string;
      if (!placeholderClass) {
        // Create placeholder class if it doesn't exist
        const { data: newClass, error: createClassError } = await supabase
          .from('classes')
          .insert({
            class_id: 'UNASSIGNED',
            class_name: 'Unassigned - To Be Processed',
            course_code: 'UNASSIGNED',
          })
          .select('id')
          .single();
        
        if (createClassError || !newClass) {
          throw new Error(`Failed to create placeholder class: ${createClassError?.message}`);
        }
        classIdForEnrollment = newClass.id;
      } else {
        classIdForEnrollment = placeholderClass.id;
      }

      // Create enrollment with placeholder class
      const enrollment = await createEnrollment(student.id, classIdForEnrollment);
      console.log('[webhook] Created placeholder enrollment:', enrollment.id);

      // Step 5: Create payment record
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
      console.log('[webhook] Payment link ID:', paymentLinkId);
      console.log('[webhook] Payment link URL:', paymentLinkUrl);

      return NextResponse.json({
        success: true,
        payment_id: payment.id,
        enrollment_id: enrollment.id,
        student_id: student.id,
        amount_cents: amountCents,
        payment_link_id: paymentLinkId,
        payment_link_url: paymentLinkUrl,
        stripe_session_id: session.id,
        message: 'Payment created successfully. Enrollment and class assignment can be processed by follow-up scripts.',
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


