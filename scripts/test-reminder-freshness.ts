/**
 * Verifies the tuition-reminder send endpoint (BEN-1185) always reflects the
 * transaction's live due_date, never a cached value. Run with:
 *   TRANSACTION_ID=<pending transaction id> ADMIN_TOKEN=<admin bearer token> \
 *     npm run test:reminder-freshness
 */
import { createClient } from '@supabase/supabase-js';

async function main() {
  const transactionId = process.env.TRANSACTION_ID;
  const adminToken = process.env.ADMIN_TOKEN;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  if (!transactionId || !adminToken) {
    console.error('Usage: TRANSACTION_ID=<id> ADMIN_TOKEN=<token> [BASE_URL=<url>] npm run test:reminder-freshness');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const sendReminder = async () => {
    const res = await fetch(`${baseUrl}/api/admin/transactions/${transactionId}/send-reminder`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(`Send failed: ${JSON.stringify(body)}`);
    }
    return body.dueDateSent as string;
  };

  console.log('[1/4] Sending reminder with original due_date...');
  const firstDueDate = await sendReminder();
  console.log('  dueDateSent:', firstDueDate);

  const newDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  console.log('[2/4] Updating due_date directly in Supabase to', newDueDate);
  const { error: updateError } = await supabase
    .from('transactions')
    .update({ due_date: newDueDate })
    .eq('id', transactionId);
  if (updateError) {
    throw new Error(`Failed to update due_date: ${updateError.message}`);
  }

  console.log('[3/4] Sending reminder again (should reflect the new due_date, not a cached one)...');
  const secondDueDate = await sendReminder();
  console.log('  dueDateSent:', secondDueDate);

  console.log('[4/4] Verifying...');
  if (secondDueDate === firstDueDate) {
    console.error('FAIL: second send returned the same due_date as the first — possible stale data.');
    process.exit(1);
  }
  if (new Date(secondDueDate).getTime() !== new Date(newDueDate).getTime()) {
    console.error('FAIL: second send did not reflect the updated due_date.');
    process.exit(1);
  }
  console.log('PASS: reminder send reflects the live due_date, not a cached value.');
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
