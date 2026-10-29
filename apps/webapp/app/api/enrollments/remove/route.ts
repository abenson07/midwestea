import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin, insertLog } from '@/lib/logging';
import { getStripeClient } from '@/lib/stripe';

type RefundedTransaction = { transactionId: string; amountCents: number; viaStripe: boolean };

export const runtime = 'nodejs';

/**
 * DELETE /api/enrollments/remove — Remove a student from a class roster (admin only).
 * Soft-removes the enrollment (status = removed) so payment transactions are preserved.
 * With refund_percentage > 0, each paid transaction is refunded through Stripe FIRST (idempotent),
 * then marked refunded in the DB. Paid rows with no Stripe payment are recorded and returned in
 * manualRefundNeeded. The enrollment is only removed after every refund succeeded.
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found. Please ensure you are registered as an admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { student_id: studentId, class_id: classId, refund_percentage: refundPercentage } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: student_id, class_id' },
        { status: 400 }
      );
    }

    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('id, enrollment_status')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message || 'Failed to look up enrollment' },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (enrollment.enrollment_status === 'removed') {
      return NextResponse.json({
        success: true,
        removedCount: 0,
        alreadyRemoved: true,
      });
    }

    const refundedTransactions: RefundedTransaction[] = [];
    const manualRefundNeeded: { transactionId: string; amountCents: number }[] = [];

    if (
      typeof refundPercentage === 'number' &&
      Number.isFinite(refundPercentage) &&
      refundPercentage > 0 &&
      refundPercentage <= 100
    ) {
      // 'refunded' rows are included only so a retry after a partial failure can report
      // what was already refunded; they are never refunded again.
      const { data: paidTransactions, error: paidError } = await supabase
        .from('transactions')
        .select('id, amount_paid, transaction_status, refund_amount, stripe_payment_intent_id, stripe_invoice_id')
        .eq('enrollment_id', enrollment.id)
        .in('transaction_status', ['paid', 'refunded']);

      if (paidError) {
        return NextResponse.json(
          { success: false, error: `Failed to look up paid transactions: ${paidError.message}` },
          { status: 500 }
        );
      }

      const rows = paidTransactions || [];
      // Rows refunded by an earlier (partially failed) attempt count toward the totals.
      for (const t of rows) {
        if (t.transaction_status === 'refunded' && ((t.refund_amount as number) || 0) > 0) {
          refundedTransactions.push({
            transactionId: t.id as string,
            amountCents: t.refund_amount as number,
            viaStripe: true,
          });
        }
      }
      const toProcess = rows.filter((t) => t.transaction_status === 'paid');

      const failureResponse = (failedId: string, reason: string, stage: string) => {
        const done = refundedTransactions.map((r) => ({ transactionId: r.transactionId, amountCents: r.amountCents }));
        const doneText = done.length
          ? `Already refunded (not repeated on retry): ${done.map((d) => `${d.transactionId} (${d.amountCents} cents)`).join(', ')}.`
          : 'No transactions were refunded.';
        return NextResponse.json(
          {
            success: false,
            error: `Refund failed for transaction ${failedId} (${stage}): ${reason}. ${doneText} The student was NOT removed; fix the problem and retry.`,
            failedTransactionId: failedId,
            refundedTransactions: done,
            manualRefundNeeded,
          },
          { status: 502 }
        );
      };

      let stripe: ReturnType<typeof getStripeClient> | null = null;

      for (const transaction of toProcess) {
        const amountPaid = (transaction.amount_paid as number) || 0; // cents
        const refundCents = Math.round((amountPaid * refundPercentage) / 100);

        if (refundCents <= 0) continue;

        // Resolve the Stripe payment to refund.
        let paymentIntentId: string | null = (transaction.stripe_payment_intent_id as string | null) || null;
        if (!paymentIntentId && transaction.stripe_invoice_id) {
          try {
            stripe = stripe || getStripeClient();
            const invoice = await stripe.invoices.retrieve(transaction.stripe_invoice_id as string);
            paymentIntentId =
              typeof invoice.payment_intent === 'string'
                ? invoice.payment_intent
                : invoice.payment_intent?.id ?? null;
          } catch (e) {
            return failureResponse(transaction.id, e instanceof Error ? e.message : 'Could not look up Stripe invoice', 'invoice lookup');
          }
        }

        if (paymentIntentId) {
          try {
            stripe = stripe || getStripeClient();
            await stripe.refunds.create(
              { payment_intent: paymentIntentId, amount: refundCents },
              { idempotencyKey: `enrollment-remove-refund-${transaction.id}-${refundCents}` }
            );
          } catch (e) {
            return failureResponse(transaction.id, e instanceof Error ? e.message : 'Stripe refund failed', 'Stripe');
          }
        } else {
          // Paid out of band / legacy: nothing in Stripe to refund. Record it and tell the admin.
          manualRefundNeeded.push({ transactionId: transaction.id, amountCents: refundCents });
        }

        // Stripe has succeeded (or there was nothing to refund) -- only now record it.
        const { error: refundError } = await supabase
          .from('transactions')
          .update({
            transaction_status: 'refunded',
            refund_percentage: refundPercentage,
            refund_amount: refundCents,
          })
          .eq('id', transaction.id);

        if (refundError) {
          return failureResponse(
            transaction.id,
            `Stripe refund${paymentIntentId ? ' succeeded' : ' not needed'} but recording it failed: ${refundError.message}`,
            'database'
          );
        }

        refundedTransactions.push({
          transactionId: transaction.id,
          amountCents: refundCents,
          viaStripe: Boolean(paymentIntentId),
        });
      }
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from('enrollments')
      .update({
        enrollment_status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
      .select('id');

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to remove enrollment' },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    await insertLog({
      admin_user_id: admin.id,
      reference_id: classId,
      reference_type: 'class',
      action_type: 'student_removed',
      student_id: studentId,
      class_id: classId,
    });

    return NextResponse.json({
      success: true,
      removedCount: updatedRows.length,
      refundedTransactions,
      refundedCents: refundedTransactions.reduce((sum, r) => sum + r.amountCents, 0),
      manualRefundNeeded,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in enrollments/remove API:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
