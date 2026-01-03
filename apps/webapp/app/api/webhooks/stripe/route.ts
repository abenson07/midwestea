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
  findClassWithCourse,
  getClassType,
  createTransaction,
  isPaymentIntentProcessed,
  updateStudentNameIfNeeded,
  updateStudentStripeCustomerId,
  getNextTransactionInvoiceNumber,
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
  const stripe = getStripeClient(stripeSecretKey);

  try {
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

      // Extract data from session
      const email = session.customer_email || session.customer_details?.email;
      const fullName = session.metadata?.full_name;
      const classId = session.metadata?.class_id;
      
      // Get payment intent ID
      let paymentIntentId: string | null = null;
      if (session.payment_intent) {
        paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
      }

      // Get product ID from line items
      let productId: string | null = null;
      try {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items']
        });
        
        if (fullSession.line_items?.data && fullSession.line_items.data.length > 0) {
          const lineItem = fullSession.line_items.data[0];
          if (lineItem.price?.product) {
            productId = typeof lineItem.price.product === 'string' 
              ? lineItem.price.product 
              : lineItem.price.product.id;
          }
        }
      } catch (err) {
        console.warn('[webhook] Failed to retrieve line items:', err);
      }

      // Validate required data
      if (!email) {
        console.error('[webhook] Could not extract email from checkout session');
        return NextResponse.json(
          { error: 'Could not extract email from checkout session' },
          { status: 400 }
        );
      }

      if (!fullName) {
        console.error('[webhook] Could not extract full_name from checkout session metadata');
        return NextResponse.json(
          { error: 'Could not extract full_name from checkout session metadata' },
          { status: 400 }
        );
      }

      if (!classId) {
        console.error('[webhook] Could not extract class_id from checkout session metadata');
        return NextResponse.json(
          { error: 'Could not extract class_id from checkout session metadata' },
          { status: 400 }
        );
      }

      if (!paymentIntentId) {
        console.error('[webhook] Could not extract payment_intent from checkout session');
        return NextResponse.json(
          { error: 'Could not extract payment_intent from checkout session' },
          { status: 400 }
        );
      }

      console.log('[webhook] Extracted data:', { email, fullName, classId, paymentIntentId, productId });

      // Safety check: Has this checkout session already been processed?
      // Check by payment intent ID for idempotency (Stripe retries failed webhooks)
      const supabase = createSupabaseAdminClient();
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .limit(1);
      
      if (existingTransaction && existingTransaction.length > 0) {
        console.log('[webhook] Payment intent already processed, exiting safely:', paymentIntentId);
        return NextResponse.json({
          success: true,
          message: 'Payment intent already processed (idempotency check)',
          session_id: session.id,
          payment_intent_id: paymentIntentId,
        });
      }

      // Extract customer ID and amount from session
      const customerId = typeof session.customer === 'string' 
        ? session.customer 
        : session.customer?.id || null;
      const amountTotal = session.amount_total || 0; // Amount in cents

      // Step 1: Create or update student
      const student = await findOrCreateStudent(email);
      console.log('[webhook] Student found/created:', student.id);

      // Update student name if needed
      await updateStudentNameIfNeeded(student.id, fullName);
      console.log('[webhook] Student name updated if needed');

      // Update student stripe_customer_id if we have it
      if (customerId) {
        await updateStudentStripeCustomerId(student.id, customerId);
        console.log('[webhook] Student stripe_customer_id updated:', customerId);
      }

      // Step 2: Fetch class with course information and pricing
      const { 
        class: classRecord, 
        courseType, 
        classStartDate,
        registrationFee,
        price
      } = await findClassWithCourse(classId);
      console.log('[webhook] Class found:', classRecord.id, 'Type:', courseType);

      // Step 3: Create enrollment
      const enrollment = await createEnrollment(student.id, classRecord.id);
      console.log('[webhook] Enrollment created:', enrollment.id);

      // Step 4: Get the next invoice number (before creating any transactions)
      // This ensures invoice numbers are assigned sequentially
      const baseInvoiceNumber = await getNextTransactionInvoiceNumber();
      console.log('[webhook] Next invoice number:', baseInvoiceNumber);

      // Step 5: Create transactions based on class type
      const now = new Date().toISOString();
      const transactions = [];
      let invoiceNumberCounter = baseInvoiceNumber;

      if (courseType === 'course') {
        // For courses: Create 1 transaction (Registration Fee)
        const transaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: student.id,
          classId: classRecord.id,
          classType: 'course',
          transactionType: 'registration_fee',
          quantity: 1,
          stripePaymentIntentId: paymentIntentId,
          transactionStatus: 'paid',
          paymentDate: now,
          dueDate: now,
          amountDue: registrationFee,
          amountPaid: amountTotal,
          invoiceNumber: invoiceNumberCounter++,
        });
        transactions.push(transaction);
        console.log('[webhook] Created course transaction:', transaction.id, 'invoice_number:', transaction.invoice_number);
      } else if (courseType === 'program') {
        // For programs: Create 3 transactions in order:
        // 1. Registration Fee (paid) - first invoice number
        const regFeeTransaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: student.id,
          classId: classRecord.id,
          classType: 'program',
          transactionType: 'registration_fee',
          quantity: 1,
          stripePaymentIntentId: paymentIntentId,
          transactionStatus: 'paid',
          paymentDate: now,
          dueDate: now,
          amountDue: registrationFee,
          amountPaid: amountTotal,
          invoiceNumber: invoiceNumberCounter++,
        });
        transactions.push(regFeeTransaction);
        console.log('[webhook] Created program registration fee transaction:', regFeeTransaction.id, 'invoice_number:', regFeeTransaction.invoice_number);

        // 2. Tuition A (pending, due 3 weeks before class start) - second invoice number
        let tuitionADueDate: string | null = null;
        if (classStartDate) {
          const startDate = new Date(classStartDate);
          startDate.setDate(startDate.getDate() - 21); // 3 weeks before
          tuitionADueDate = startDate.toISOString();
        }

        const tuitionATransaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: student.id,
          classId: classRecord.id,
          classType: 'program',
          transactionType: 'tuition_a',
          quantity: 0.5,
          stripePaymentIntentId: null,
          transactionStatus: 'pending',
          paymentDate: null,
          dueDate: tuitionADueDate,
          amountDue: price,
          amountPaid: null,
          invoiceNumber: invoiceNumberCounter++,
        });
        transactions.push(tuitionATransaction);
        console.log('[webhook] Created program tuition A transaction:', tuitionATransaction.id, 'invoice_number:', tuitionATransaction.invoice_number);

        // 3. Tuition B (pending, due 1 week after class start) - third invoice number
        let tuitionBDueDate: string | null = null;
        if (classStartDate) {
          const startDate = new Date(classStartDate);
          startDate.setDate(startDate.getDate() + 7); // 1 week after
          tuitionBDueDate = startDate.toISOString();
        }

        const tuitionBTransaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: student.id,
          classId: classRecord.id,
          classType: 'program',
          transactionType: 'tuition_b',
          quantity: 0.5,
          stripePaymentIntentId: null,
          transactionStatus: 'pending',
          paymentDate: null,
          dueDate: tuitionBDueDate,
          amountDue: price,
          amountPaid: null,
          invoiceNumber: invoiceNumberCounter++,
        });
        transactions.push(tuitionBTransaction);
        console.log('[webhook] Created program tuition B transaction:', tuitionBTransaction.id, 'invoice_number:', tuitionBTransaction.invoice_number);
      } else {
        // Default to course if type cannot be determined
        console.warn('[webhook] Could not determine class type, defaulting to course');
        const transaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: student.id,
          classId: classRecord.id,
          classType: 'course',
          transactionType: 'registration_fee',
          quantity: 1,
          stripePaymentIntentId: paymentIntentId,
          transactionStatus: 'paid',
          paymentDate: now,
          dueDate: now,
          amountDue: registrationFee,
          amountPaid: amountTotal,
          invoiceNumber: invoiceNumberCounter++,
        });
        transactions.push(transaction);
      }

      return NextResponse.json({
        success: true,
        student_id: student.id,
        enrollment_id: enrollment.id,
        class_id: classRecord.id,
        class_type: courseType || 'course',
        payment_intent_id: paymentIntentId,
        product_id: productId,
        transactions_created: transactions.length,
        transaction_ids: transactions.map(t => t.id),
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

  // Handle payout.paid event
  if (event.type === 'payout.paid') {
    try {
      const payout = event.data.object as Stripe.Payout;
      const payoutId = payout.id;
      const payoutDate = payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : new Date().toISOString();
      
      console.log('[webhook] Processing payout.paid:', payoutId);

      const supabase = createSupabaseAdminClient();

      // Check if this payout has already been processed (idempotency)
      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('payout_id', payoutId)
        .limit(1);

      if (existingTransactions && existingTransactions.length > 0) {
        console.log('[webhook] Payout already processed, exiting safely:', payoutId);
        return NextResponse.json({
          success: true,
          message: 'Payout already processed (idempotency check)',
          payout_id: payoutId,
        });
      }

      // Query Stripe balance transactions for this payout
      // Use expand to get charges and payment intents in a single call
      // Handle pagination in case there are more than 100 transactions
      const paymentIntentIds: string[] = [];
      let hasMore = true;
      let startingAfter: string | undefined = undefined;

      while (hasMore) {
        const balanceTransactions = await stripe.balanceTransactions.list({
          payout: payoutId,
          expand: ['data.source'],
          limit: 100, // Stripe allows up to 100 per page
          ...(startingAfter && { starting_after: startingAfter }),
        });

        console.log('[webhook] Found', balanceTransactions.data.length, 'balance transactions for payout', payoutId);

        // Extract payment intent IDs from balance transactions
        for (const balanceTransaction of balanceTransactions.data) {
          // Only process charge transactions
          if (balanceTransaction.type === 'charge') {
            const source = balanceTransaction.source;
            
            // Source can be a charge object (when expanded) or a string ID
            if (typeof source === 'object' && source !== null && 'object' in source) {
              const charge = source as Stripe.Charge;
              
              // Get payment intent from charge
              if (charge.payment_intent) {
                const paymentIntentId = typeof charge.payment_intent === 'string' 
                  ? charge.payment_intent 
                  : charge.payment_intent.id;
                
                if (paymentIntentId) {
                  paymentIntentIds.push(paymentIntentId);
                }
              }
            }
          }
        }

        // Check if there are more pages
        hasMore = balanceTransactions.has_more;
        if (hasMore && balanceTransactions.data.length > 0) {
          startingAfter = balanceTransactions.data[balanceTransactions.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }

      console.log('[webhook] Extracted', paymentIntentIds.length, 'payment intent IDs from payout');

      if (paymentIntentIds.length === 0) {
        console.warn('[webhook] No payment intents found in payout', payoutId);
        return NextResponse.json({
          success: true,
          message: 'No payment intents found in payout',
          payout_id: payoutId,
        });
      }

      // Update transactions with payout_id and payout_date
      // Match by stripe_payment_intent_id
      const { data: updatedTransactions, error: updateError } = await supabase
        .from('transactions')
        .update({
          payout_id: payoutId,
          payout_date: payoutDate,
        })
        .in('stripe_payment_intent_id', paymentIntentIds)
        .select('id');

      if (updateError) {
        console.error('[webhook] Error updating transactions with payout_id:', updateError);
        return NextResponse.json(
          {
            error: 'Failed to update transactions',
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      console.log('[webhook] Updated', updatedTransactions?.length || 0, 'transactions with payout_id:', payoutId);

      return NextResponse.json({
        success: true,
        payout_id: payoutId,
        payout_date: payoutDate,
        payment_intent_ids_count: paymentIntentIds.length,
        transactions_updated: updatedTransactions?.length || 0,
      });
    } catch (error: any) {
      console.error('[webhook] Error processing payout.paid:', {
        error: error.message,
        stack: error.stack,
        payout_id: (event.data.object as Stripe.Payout).id,
      });
      
      return NextResponse.json(
        {
          error: 'Failed to process payout.paid webhook',
          details: error.message,
        },
        { status: 500 }
      );
    }
  }

  // Handle payment_intent events - IGNORED per user request
  // Payment processing is now handled via checkout.session.completed
  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.created') {
    console.log('[webhook] Ignoring payment_intent event (handled by checkout.session.completed):', event.type);
    return NextResponse.json({ 
      received: true, 
      message: 'Event ignored - handled by checkout.session.completed' 
    });
  }

  // Return success for other event types (we only handle payment_intent.succeeded)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks/stripe/route.ts:208',message:'Unhandled event type',data:{eventType:event.type,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[webhook] Received unhandled event type:', event.type);
  return NextResponse.json({ received: true });
}


