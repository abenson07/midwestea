import fs from 'fs';
import path from 'path';
import { createSupabaseAdminClient } from '@midwestea/utils';
import {
  sendEmail,
  logEmailToDatabase,
  validateEmail,
  escapeHtml,
  formatCurrency,
  formatDate,
  renderTemplate,
} from './email';

/**
 * Receipt for payments on the tuition invoices (tuition_a / tuition_b / custom).
 * Registration and pay-in-full payments are NOT covered here -- those already get
 * the enrollment confirmation email.
 *
 * Takes every transaction paid by ONE payment so a pay-remaining checkout that
 * settles both tuition invoices sends a single combined receipt, not two.
 * Never throws: a receipt failure must not fail the webhook that marked the
 * invoices paid (Stripe would retry an already-completed operation).
 */
const RECEIPT_TYPES = new Set(['tuition_a', 'tuition_b', 'custom']);

const LINE_LABELS: Record<string, string> = {
  tuition_a: 'First Tuition Payment',
  tuition_b: 'Second Tuition Payment',
  custom: 'Tuition Payment',
};

export async function sendTuitionReceiptEmail(transactionIds: string[]): Promise<void> {
  try {
    if (transactionIds.length === 0) return;
    const supabase = createSupabaseAdminClient();

    const { data: paidRows, error } = await supabase
      .from('transactions')
      .select('id, enrollment_id, student_id, class_id, transaction_type, amount_due, quantity, amount_paid, payment_date, invoice_number')
      .in('id', transactionIds);
    if (error) throw new Error(error.message);

    const rows = (paidRows || []).filter((r) => RECEIPT_TYPES.has(r.transaction_type || ''));
    if (rows.length === 0) return;

    const studentId = rows[0].student_id;
    const enrollmentId = rows[0].enrollment_id;
    if (!studentId) return;

    const { data: student } = await supabase
      .from('students')
      .select('id, first_name, last_name, full_name')
      .eq('id', studentId)
      .maybeSingle();
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(studentId);
    const email = authUser?.user?.email;
    if (userError || !email) throw new Error(userError?.message || 'Student email not found');
    validateEmail(email, 'student email');

    let programName = 'your program';
    if (rows[0].class_id) {
      const { data: cls } = await supabase.from('classes').select('class_name').eq('id', rows[0].class_id).maybeSingle();
      if (cls?.class_name) programName = cls.class_name;
    }

    // Anything on this enrollment still unpaid -> tell them what's left.
    let remainingCents = 0;
    if (enrollmentId) {
      const { data: pending } = await supabase
        .from('transactions')
        .select('amount_due, quantity')
        .eq('enrollment_id', enrollmentId)
        .eq('transaction_status', 'pending');
      remainingCents = (pending || []).reduce((s, t) => s + (t.amount_due || 0) * (t.quantity || 1), 0);
    }

    const sorted = [...rows].sort((a, b) => (a.invoice_number || 0) - (b.invoice_number || 0));
    const lineItemsHtml = sorted
      .map((r) => {
        const cents = r.amount_paid ?? (r.amount_due || 0) * (r.quantity || 1);
        return `<tr><td style="padding: 5px 0; color: #666666; font-size: 14px;">${escapeHtml(LINE_LABELS[r.transaction_type || ''] || 'Tuition Payment')}${r.invoice_number ? ` (Invoice #${r.invoice_number})` : ''}:</td><td style="padding: 5px 0; text-align: right; color: #333333; font-size: 14px;">${formatCurrency(cents)}</td></tr>`;
      })
      .join('');
    const totalCents = sorted.reduce(
      (s, r) => s + (r.amount_paid ?? (r.amount_due || 0) * (r.quantity || 1)),
      0
    );

    const studentName =
      `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || student?.full_name || 'Student';
    const paymentDate = sorted[0].payment_date || new Date();

    let html = fs.readFileSync(path.join(process.cwd(), 'lib', 'email-templates', 'tuition-receipt.html'), 'utf-8');
    // Pre-substituted: renderTemplate HTML-escapes values, which would mangle the row markup.
    html = html.replace('{{lineItemsHtml}}', lineItemsHtml);
    html = renderTemplate(html, {
      studentName,
      programName,
      totalPaid: formatCurrency(totalCents),
      paymentDate: formatDate(paymentDate, 'date'),
      balanceMessage:
        remainingCents > 0
          ? `Your remaining balance for this program is ${formatCurrency(remainingCents)}.`
          : 'Your tuition for this program is now paid in full.',
      currentYear: String(new Date().getFullYear()),
    });

    const subject = `Payment received — ${programName}`;
    const result = await sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@midwestea.com',
      to: email,
      subject,
      html,
      tags: [
        { name: 'email_type', value: 'tuition_receipt' },
        { name: 'student_id', value: studentId },
      ],
      metadata: { transaction_ids: sorted.map((r) => r.id).join(','), student_id: studentId, enrollment_id: enrollmentId || '' },
    });

    await logEmailToDatabase({
      recipient_email: email,
      recipient_name: studentName,
      subject,
      email_type: 'tuition_receipt',
      enrollment_id: enrollmentId || undefined,
      student_id: studentId,
      success: result.success,
      email_id: result.id,
      error: result.error,
      retries: result.retries || 0,
    });
  } catch (err: any) {
    console.error('[sendTuitionReceiptEmail] Failed:', err?.message || err);
  }
}
