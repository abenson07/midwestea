import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import Stripe from 'stripe';
import {
  findOrCreateStudent,
  getOrCreateStripeCustomer,
  findClassByClassId,
  createEnrollment,
  createPayment,
} from '@/lib/enrollments';
import { insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

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

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient(stripeSecretKey);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[webhook] Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('[webhook] Processing payment_intent.succeeded:', paymentIntent.id);

      // Extract classId from metadata
      const classId = paymentIntent.metadata?.classId;
      if (!classId) {
        console.error('[webhook] Missing classId in payment intent metadata');
        return NextResponse.json(
          { error: 'Missing classId in payment intent metadata' },
          { status: 400 }
        );
      }

      // Extract email from payment intent
      // Try customer email first, then billing details
      let email: string | undefined;
      
      if (paymentIntent.customer) {
        const stripe = getStripeClient(stripeSecretKey);
        let customer: Stripe.Customer | Stripe.DeletedCustomer;
        
        if (typeof paymentIntent.customer === 'string') {
          customer = await stripe.customers.retrieve(paymentIntent.customer);
        } else {
          customer = paymentIntent.customer;
        }
        
        if (!customer.deleted && customer.email) {
          email = customer.email;
        }
      }

      // Fallback to receipt_email
      if (!email) {
        email = paymentIntent.receipt_email || undefined;
      }

      if (!email) {
        console.error('[webhook] Could not extract email from payment intent');
        return NextResponse.json(
          { error: 'Could not extract email from payment intent' },
          { status: 400 }
        );
      }

      console.log('[webhook] Extracted email:', email, 'classId:', classId);

      // Step 1: Find or create student
      const student = await findOrCreateStudent(email);
      console.log('[webhook] Student found/created:', student.id);

      // Step 2: Get or create Stripe customer
      await getOrCreateStripeCustomer(student, email, paymentIntent);
      console.log('[webhook] Stripe customer ensured for student:', student.id);

      // Step 3: Find class by class_id
      const classRecord = await findClassByClassId(classId);
      console.log('[webhook] Class found:', classRecord.id, 'class_id:', classRecord.class_id);

      // Step 4: Create enrollment
      const enrollment = await createEnrollment(student.id, classRecord.id);
      console.log('[webhook] Enrollment created/found:', enrollment.id);

      // Step 5: Create payment record
      const amountCents = paymentIntent.amount;
      const payment = await createPayment(enrollment.id, paymentIntent, amountCents);
      console.log('[webhook] Payment created:', payment.id);

      // Step 6: Log student registration (admin_user_id is null for Stripe actions)
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
        // Don't fail the webhook if logging fails
      }

      // Step 7: Log payment success (admin_user_id is null for Stripe actions)
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
        // Don't fail the webhook if logging fails
      }

      return NextResponse.json({
        success: true,
        student_id: student.id,
        enrollment_id: enrollment.id,
        payment_id: payment.id,
        class_id: classRecord.id,
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
  console.log('[webhook] Received unhandled event type:', event.type);
  return NextResponse.json({ received: true });
}


