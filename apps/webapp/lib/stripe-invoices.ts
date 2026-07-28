import { createSupabaseAdminClient } from '@midwestea/utils';
import { getStripeClient } from './stripe';
import { applyPaidUpdate } from './invoice-payments';

/**
 * Create a Stripe Invoice for a fixed amount with a specific due date, and
 * finalize it immediately so it has a hosted_invoice_url the student can pay.
 *
 * Takes a final amountCents rather than a quantity multiplier — callers
 * (registration-time tuition creation, admin void-and-reissue) each have
 * their own amount math; keeping that out of this helper is what makes it
 * reusable for both shapes without a leaky abstraction.
 */
export async function createAndFinalizeStripeInvoice(params: {
  customerId: string;
  amountCents: number;
  dueDate: string; // ISO date string
  description: string;
  metadata?: Record<string, string>;
}): Promise<{ stripeInvoiceId: string; hostedInvoiceUrl: string | null }> {
  const stripe = getStripeClient();

  const invoice = await stripe.invoices.create({
    customer: params.customerId,
    collection_method: 'send_invoice',
    due_date: Math.floor(new Date(params.dueDate).getTime() / 1000),
    auto_advance: false,
    metadata: params.metadata,
  });

  await stripe.invoiceItems.create({
    customer: params.customerId,
    invoice: invoice.id,
    amount: params.amountCents,
    currency: 'usd',
    description: params.description,
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

  return {
    stripeInvoiceId: finalized.id,
    hostedInvoiceUrl: finalized.hosted_invoice_url ?? null,
  };
}

/**
 * Void an open (unpaid) Stripe Invoice. Used both as a compensating action
 * when a paired DB write fails after Stripe succeeded, and as the real
 * "void" half of the admin void-and-reissue exception path.
 */
export async function voidStripeInvoice(stripeInvoiceId: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.invoices.voidInvoice(stripeInvoiceId);
}

/**
 * Mark the transaction linked to a Stripe Invoice as paid, in response to an
 * invoice.paid webhook event. Shares its "already paid -> no-op" guard with
 * every other paid-marking path via applyPaidUpdate — this is what makes it
 * safe for payStripeInvoiceOutOfBand's self-triggering invoice.paid event
 * (see below) to hit this same function a second time for the same row.
 *
 * Not found -> matched:false rather than an error. An unmatched stripe_invoice_id
 * will never resolve on retry, so the webhook route treats this as a 200 + log,
 * not a failure Stripe should keep retrying.
 */
export async function markTransactionPaidByInvoiceId(
  stripeInvoiceId: string,
  update: { paymentIntentId: string | null; amountPaidCents: number }
): Promise<{ matched: boolean; alreadyProcessed: boolean }> {
  const supabase = createSupabaseAdminClient();

  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('id, transaction_status')
    .eq('stripe_invoice_id', stripeInvoiceId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to look up transaction for stripe_invoice_id ${stripeInvoiceId}: ${fetchError.message}`);
  }

  if (!transaction) {
    return { matched: false, alreadyProcessed: false };
  }

  const result = await applyPaidUpdate(transaction, update);
  return { matched: true, alreadyProcessed: result.alreadyProcessed };
}

/**
 * Mark an open Stripe Invoice paid without an actual Stripe-collected charge —
 * used to reconcile a tuition invoice that was actually settled via the
 * combined pay-remaining Checkout Session instead of its own hosted page.
 *
 * This itself fires a fresh invoice.paid webhook event for the same invoice.
 * That's expected, not a bug: by the time that event arrives the DB row is
 * already 'paid' (set synchronously by the caller before/after this call),
 * so markTransactionPaidByInvoiceId's applyPaidUpdate guard makes it a no-op.
 */
export async function payStripeInvoiceOutOfBand(stripeInvoiceId: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.invoices.pay(stripeInvoiceId, { paid_out_of_band: true });
}

/**
 * Update the due date on an already-finalized (open) Stripe Invoice.
 *
 * Stripe's docs list monetary values and collection_method as immutable
 * after finalization but don't say the same about due_date — this is the
 * direct-update attempt; callers should fall back to voiding and reissuing
 * a replacement invoice if this throws.
 */
export async function updateStripeInvoiceDueDate(stripeInvoiceId: string, dueDate: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.invoices.update(stripeInvoiceId, {
    due_date: Math.floor(new Date(dueDate).getTime() / 1000),
  });
}
