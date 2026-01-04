import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@midwestea/utils';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * Sync Stripe payment intents to invoices_to_import table
 * GET /api/sync-stripe-invoices?limit=100
 * 
 * Fetches payment intents from Stripe and creates invoice records for ones that don't exist yet
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[sync-stripe-invoices] Starting sync...');
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Get Stripe client
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'STRIPE_SECRET_KEY is not set',
        },
        { status: 500 }
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const supabase = createSupabaseAdminClient();

    console.log('[sync-stripe-invoices] Fetching payment intents from Stripe (limit:', limit, ')...');

    // Fetch payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: limit,
    });

    console.log('[sync-stripe-invoices] Found', paymentIntents.data.length, 'payment intents');

    // Get existing payment intent IDs from transactions table to avoid duplicates
    const { data: existingTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('stripe_payment_intent_id')
      .not('stripe_payment_intent_id', 'is', null);

    const existingPaymentIntentIds = new Set(
      (existingTransactions || [])
        .map(t => t.stripe_payment_intent_id)
        .filter(Boolean)
    );

    console.log('[sync-stripe-invoices] Found', existingPaymentIntentIds.size, 'existing payment intents in database');

    const results = {
      total: paymentIntents.data.length,
      processed: 0,
      skipped: 0,
      created: 0,
      errors: [] as any[],
    };

    // Process each payment intent
    for (const paymentIntent of paymentIntents.data) {
      try {
        // Skip if already processed (exists in payments table)
        if (existingPaymentIntentIds.has(paymentIntent.id)) {
          console.log('[sync-stripe-invoices] Skipping', paymentIntent.id, '- already exists');
          results.skipped++;
          continue;
        }

        // Only process succeeded payment intents
        if (paymentIntent.status !== 'succeeded') {
          console.log('[sync-stripe-invoices] Skipping', paymentIntent.id, '- status:', paymentIntent.status);
          results.skipped++;
          continue;
        }

        console.log('[sync-stripe-invoices] Processing payment intent:', paymentIntent.id);

        // Extract email
        let email = paymentIntent.receipt_email || 
                    paymentIntent.metadata?.email || 
                    'unknown@example.com';

        // Try to get customer email if available
        if (paymentIntent.customer && typeof paymentIntent.customer === 'string') {
          try {
            const customer = await stripe.customers.retrieve(paymentIntent.customer);
            if (!customer.deleted && customer.email) {
              email = customer.email;
            }
          } catch (err) {
            // Ignore customer retrieval errors
          }
        }

        // Get the next invoice number
        const { data: maxInvoice } = await supabase
          .from('invoices_to_import')
          .select('invoice_number')
          .order('invoice_number', { ascending: false })
          .limit(1)
          .single();

        let nextInvoiceNumber = 100001;
        if (maxInvoice?.invoice_number) {
          nextInvoiceNumber = maxInvoice.invoice_number + 1;
        }

        // Create invoice data
        const paymentDate = new Date(paymentIntent.created * 1000);
        const invoiceDate = paymentDate.toISOString().split('T')[0];
        const dueDate = new Date(paymentDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // Build item string from metadata or use default
        const classId = paymentIntent.metadata?.classId || 'unknown';
        const courseCode = paymentIntent.metadata?.courseCode || 'UNKNOWN';
        const item = `${courseCode}:${classId}:registration`;

        // Build memo
        const memoParts = [
          'Registration',
          paymentIntent.metadata?.productName || '',
          courseCode,
          classId,
        ].filter(Boolean);
        const memo = memoParts.join(', ') || `Payment from ${email}`;

        // Split amount in half for two invoices (like the original logic)
        const amountCents = paymentIntent.amount || 0;
        const amountPerInvoice = Math.floor(amountCents / 2);

        // Create two invoice records
        const invoicesToInsert = [
          {
            invoice_number: nextInvoiceNumber,
            customer_email: email,
            invoice_date: invoiceDate,
            due_date: dueDateStr,
            item: item,
            memo: memo,
            item_amount: amountPerInvoice,
            item_quantity: 1,
            item_rate: 0.5,
            payment_id: null, // Will be null since we're not creating payment records here
            class_id: null, // Will be null since we don't have class UUID
            invoice_sequence: 1,
            category: courseCode !== 'UNKNOWN' ? courseCode : null,
            subcategory: classId !== 'unknown' ? classId : null,
          },
          {
            invoice_number: nextInvoiceNumber + 1,
            customer_email: email,
            invoice_date: invoiceDate,
            due_date: dueDateStr,
            item: item,
            memo: memo,
            item_amount: amountPerInvoice,
            item_quantity: 1,
            item_rate: 0.5,
            payment_id: null,
            class_id: null,
            invoice_sequence: 2,
            category: courseCode !== 'UNKNOWN' ? courseCode : null,
            subcategory: classId !== 'unknown' ? classId : null,
          },
        ];

        // Insert invoices
        const { data: insertedInvoices, error: insertError } = await supabase
          .from('invoices_to_import')
          .insert(invoicesToInsert)
          .select();

        if (insertError) {
          console.error('[sync-stripe-invoices] Failed to insert invoices for', paymentIntent.id, ':', insertError.message);
          results.errors.push({
            payment_intent_id: paymentIntent.id,
            error: insertError.message,
            code: insertError.code,
          });
          continue;
        }

        console.log('[sync-stripe-invoices] ✅ Created invoices for', paymentIntent.id, '- invoice numbers:', 
          insertedInvoices?.map(i => i.invoice_number).join(', '));
        
        results.created += insertedInvoices?.length || 0;
        results.processed++;
      } catch (error: any) {
        console.error('[sync-stripe-invoices] Error processing', paymentIntent.id, ':', error.message);
        results.errors.push({
          payment_intent_id: paymentIntent.id,
          error: error.message,
        });
      }
    }

    console.log('[sync-stripe-invoices] ✅ Sync complete:', results);

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      results: {
        total: results.total,
        processed: results.processed,
        skipped: results.skipped,
        created: results.created,
        errors: results.errors.length,
        errorDetails: results.errors,
      },
    });
  } catch (error: any) {
    console.error('[sync-stripe-invoices] Unexpected error:', {
      error: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

