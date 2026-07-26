import { createSupabaseAdminClient } from '@midwestea/utils';

export async function markTransactionPaidFromCheckout(
  transactionId: string,
  paymentIntentId: string,
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
  if (transaction.transaction_status === 'paid') {
    return { success: true, alreadyProcessed: true };
  }

  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      transaction_status: 'paid',
      payment_date: new Date().toISOString(),
      amount_paid: amountPaidCents,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', transactionId);

  if (updateError) {
    throw new Error(`Failed to mark transaction ${transactionId} paid: ${updateError.message}`);
  }

  return { success: true, alreadyProcessed: false };
}
