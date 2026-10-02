import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * Shared "mark this transaction paid" guard + update, used by every path that
 * can mark a transaction paid: a direct single-invoice Checkout Session, a
 * collapsed pay-remaining Checkout Session, and (via lib/stripe-invoices.ts)
 * a Stripe invoice.paid webhook event. Keyed on transaction_status, not on
 * any Stripe event/session ID — this is what makes it safe for the same
 * transaction to be marked paid more than once (e.g. a Stripe webhook retry,
 * or the self-triggering invoice.paid event fired by paid_out_of_band).
 */
export async function applyPaidUpdate(
  transaction: { id: string; transaction_status: string | null },
  update: { paymentIntentId: string | null; amountPaidCents: number }
): Promise<{ success: boolean; alreadyProcessed: boolean }> {
  if (transaction.transaction_status === 'paid') {
    return { success: true, alreadyProcessed: true };
  }

  const supabase = createSupabaseAdminClient();
  // Conditional on not-yet-paid so that of two concurrent/duplicate events exactly one
  // reports alreadyProcessed:false -- callers use that to send the receipt email once.
  const { data: updated, error } = await supabase
    .from('transactions')
    .update({
      transaction_status: 'paid',
      payment_date: new Date().toISOString(),
      amount_paid: update.amountPaidCents,
      stripe_payment_intent_id: update.paymentIntentId,
    })
    .eq('id', transaction.id)
    .neq('transaction_status', 'paid')
    .select('id');

  if (error) {
    throw new Error(`Failed to mark transaction ${transaction.id} paid: ${error.message}`);
  }

  return { success: true, alreadyProcessed: !updated || updated.length === 0 };
}

export async function markTransactionPaidFromCheckout(
  transactionId: string,
  paymentIntentId: string | null,
  amountPaidCents: number
): Promise<{ success: boolean; alreadyProcessed: boolean }> {
  const supabase = createSupabaseAdminClient();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('id, transaction_status')
    .eq('id', transactionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up transaction ${transactionId}: ${error.message}`);
  }
  if (!transaction) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  return applyPaidUpdate(transaction, { paymentIntentId, amountPaidCents });
}

export async function markTransactionsPaidFromCollapsedCheckout(
  transactionIds: string[],
  paymentIntentId: string
): Promise<{ success: boolean; paidCount: number; alreadyProcessedCount: number; newlyPaidIds: string[] }> {
  const supabase = createSupabaseAdminClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, transaction_status, amount_due, quantity')
    .in('id', transactionIds);

  if (error) {
    throw new Error(`Failed to look up transactions: ${error.message}`);
  }

  let paidCount = 0;
  let alreadyProcessedCount = 0;
  const newlyPaidIds: string[] = [];

  for (const transaction of transactions || []) {
    const amountPaidCents = (transaction.amount_due || 0) * (transaction.quantity || 1);
    const result = await applyPaidUpdate(transaction, { paymentIntentId, amountPaidCents });
    if (result.alreadyProcessed) {
      alreadyProcessedCount++;
    } else {
      paidCount++;
      newlyPaidIds.push(transaction.id);
    }
  }

  return { success: true, paidCount, alreadyProcessedCount, newlyPaidIds };
}
