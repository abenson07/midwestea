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
 *
 * No-ops if the invoice is already void — a void-then-reissue call that
 * succeeded at voiding but failed at reissuing (e.g. a past due_date) would
 * otherwise be permanently stuck: every retry re-voids the same dead
 * invoice and Stripe rejects it with "You can only pass in open invoices."
 */
export async function voidStripeInvoice(stripeInvoiceId: string): Promise<void> {
  const stripe = getStripeClient();
  const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
  if (invoice.status === 'void') {
    return;
  }
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
): Promise<{ matched: boolean; alreadyProcessed: boolean; transactionId: string | null }> {
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
    return { matched: false, alreadyProcessed: false, transactionId: null };
  }

  const result = await applyPaidUpdate(transaction, update);
  return { matched: true, alreadyProcessed: result.alreadyProcessed, transactionId: transaction.id };
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
 * Make sure a pending transaction has a Stripe Invoice + hosted payment URL,
 * creating one on demand if it doesn't.
 *
 * Rows created before Stripe invoices existed (or while the
 * stripe_hosted_invoice_url column was missing, or without a customer ID)
 * have no stripe_invoice_id/stripe_hosted_invoice_url, which surfaces as "no
 * payment link" for both the student Pay button and the admin reminder. This
 * heals those rows lazily at the moment someone actually needs the link, so
 * we don't mass-create invoices for stale/abandoned enrollments.
 *
 * Concurrency: two simultaneous callers may both create a Stripe invoice; the
 * conditional UPDATE (stripe_invoice_id IS NULL) lets only one win and the
 * loser voids its duplicate and returns the winner's URL.
 */
export async function ensureStripeInvoiceForTransaction(
  transactionId: string
): Promise<{ hostedInvoiceUrl: string | null; created: boolean }> {
  const supabase = createSupabaseAdminClient();

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('id, student_id, enrollment_id, transaction_type, transaction_status, amount_due, quantity, due_date, invoice_number, stripe_invoice_id, stripe_hosted_invoice_url')
    .eq('id', transactionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load transaction ${transactionId}: ${error.message}`);
  if (!tx) throw new Error(`Transaction not found: ${transactionId}`);
  if (tx.stripe_hosted_invoice_url) return { hostedInvoiceUrl: tx.stripe_hosted_invoice_url, created: false };
  if (tx.transaction_status !== 'pending') return { hostedInvoiceUrl: null, created: false };

  const amountCents = (tx.amount_due || 0) * (tx.quantity || 1);
  if (!tx.student_id || amountCents <= 0) return { hostedInvoiceUrl: null, created: false };

  const stripe = getStripeClient();

  // An invoice may already exist without a saved URL (e.g. earlier DB write
  // failed) -- reuse it instead of creating a second one.
  if (tx.stripe_invoice_id) {
    const existing = await stripe.invoices.retrieve(tx.stripe_invoice_id);
    if (existing.status === 'open' && existing.hosted_invoice_url) {
      await supabase
        .from('transactions')
        .update({ stripe_hosted_invoice_url: existing.hosted_invoice_url })
        .eq('id', tx.id);
      return { hostedInvoiceUrl: existing.hosted_invoice_url, created: false };
    }
    if (existing.status === 'paid') return { hostedInvoiceUrl: null, created: false };
    // void/uncollectible/draft: fall through and issue a fresh one below
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, stripe_customer_id, full_name')
    .eq('id', tx.student_id)
    .maybeSingle();

  let customerId = student?.stripe_customer_id || null;
  if (!customerId) {
    const { data: authUser } = await supabase.auth.admin.getUserById(tx.student_id);
    const email = authUser?.user?.email;
    if (!email) throw new Error(`Cannot create Stripe customer for student ${tx.student_id}: no email`);
    const customer = await stripe.customers.create({ email, name: student?.full_name || undefined });
    customerId = customer.id;
    await supabase.from('students').update({ stripe_customer_id: customerId }).eq('id', tx.student_id);
  }

  // Stripe requires a due_date strictly in the future; the DB due_date is left
  // untouched, only the Stripe-side one is pushed out when already past.
  const minDue = Date.now() + 24 * 60 * 60 * 1000;
  const dueMs = tx.due_date ? new Date(tx.due_date).getTime() : 0;
  const stripeDueDate = new Date(Math.max(dueMs, minDue)).toISOString();

  const description =
    tx.transaction_type === 'tuition_a' ? 'First Tuition Payment' :
    tx.transaction_type === 'tuition_b' ? 'Second Tuition Payment' :
    'Tuition Payment';

  const invoice = await createAndFinalizeStripeInvoice({
    customerId,
    amountCents,
    dueDate: stripeDueDate,
    description,
    metadata: {
      enrollment_id: tx.enrollment_id || '',
      transaction_type: tx.transaction_type || '',
      transaction_id: tx.id,
    },
  });

  const { data: updated, error: updateError } = await supabase
    .from('transactions')
    .update({
      stripe_invoice_id: invoice.stripeInvoiceId,
      stripe_hosted_invoice_url: invoice.hostedInvoiceUrl,
    })
    .eq('id', tx.id)
    .is('stripe_hosted_invoice_url', null)
    .select('id');

  if (updateError || !updated || updated.length === 0) {
    // Lost a race (or DB write failed): don't leave a duplicate payable invoice.
    await voidStripeInvoice(invoice.stripeInvoiceId).catch((e) =>
      console.error('[ensureStripeInvoice] Failed to void duplicate invoice', invoice.stripeInvoiceId, e)
    );
    if (updateError) throw new Error(`Failed to save Stripe invoice for ${tx.id}: ${updateError.message}`);
    const { data: winner } = await supabase
      .from('transactions')
      .select('stripe_hosted_invoice_url')
      .eq('id', tx.id)
      .maybeSingle();
    return { hostedInvoiceUrl: winner?.stripe_hosted_invoice_url ?? null, created: false };
  }

  return { hostedInvoiceUrl: invoice.hostedInvoiceUrl, created: true };
}
