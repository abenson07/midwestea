import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { createTransaction, getNextTransactionInvoiceNumber } from '@/lib/enrollments';
import { createAndFinalizeStripeInvoice, voidStripeInvoice } from '@/lib/stripe-invoices';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await context.params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid session' }, { status: 401 });
    }
    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ success: false, error: 'Admin not found. Please ensure you are registered as an admin.' }, { status: 403 });
    }

    const body = await request.json();
    const replacementInvoices: { amountCents: number; dueDate: string }[] = Array.isArray(body.replacementInvoices)
      ? body.replacementInvoices
      : [];
    const payInFull: boolean = body.payInFull === true;

    for (const item of replacementInvoices) {
      if (typeof item.amountCents !== 'number' || item.amountCents <= 0 || !Number.isInteger(item.amountCents)) {
        return NextResponse.json({ success: false, error: 'Each replacement invoice needs a positive integer amountCents' }, { status: 400 });
      }
      if (!item.dueDate || Number.isNaN(new Date(item.dueDate).getTime())) {
        return NextResponse.json({ success: false, error: 'Each replacement invoice needs a valid dueDate' }, { status: 400 });
      }
    }

    if (payInFull && replacementInvoices.length !== 1) {
      return NextResponse.json({ success: false, error: 'Pay in full requires exactly one replacement invoice' }, { status: 400 });
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, student_id, class_id')
      .eq('id', enrollmentId)
      .maybeSingle();
    if (enrollmentError || !enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
    }

    const { data: openTransactions, error: openError } = await supabase
      .from('transactions')
      .select('id, stripe_invoice_id')
      .eq('enrollment_id', enrollmentId)
      .eq('transaction_status', 'pending');
    if (openError) {
      return NextResponse.json({ success: false, error: openError.message }, { status: 500 });
    }
    if (!openTransactions || openTransactions.length === 0) {
      return NextResponse.json({ success: false, error: 'No open invoices to void for this enrollment' }, { status: 400 });
    }

    // Void each row's Stripe Invoice (if any) before marking it cancelled in the
    // DB, not the reverse — otherwise a DB-cancelled row's old Stripe invoice
    // would briefly still be technically open and payable via its old hosted
    // URL. Looping instead of one bulk UPDATE means a single Stripe failure
    // doesn't silently leave the rest of the batch in a DB/Stripe mismatch.
    const voidErrors: string[] = [];
    for (const row of openTransactions) {
      try {
        if (row.stripe_invoice_id) {
          await voidStripeInvoice(row.stripe_invoice_id);
        }
        const { error: cancelError } = await supabase
          .from('transactions')
          .update({ transaction_status: 'cancelled' })
          .eq('id', row.id);
        if (cancelError) {
          voidErrors.push(`${row.id}: ${cancelError.message}`);
        }
      } catch (err: any) {
        voidErrors.push(`${row.id}: ${err.message}`);
      }
    }
    if (voidErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: `Failed to void ${voidErrors.length} of ${openTransactions.length} existing invoices`, voidErrors },
        { status: 500 }
      );
    }

    // No findClassWithCourseById() exists in lib/enrollments.ts (the sibling
    // findClassWithCourse() looks up by the classes.class_id text field, not
    // the UUID this route already has from the enrollment row) — so the
    // course-type lookup is inlined here, mirroring findClassWithCourse()'s
    // own class -> course join logic but keyed by classes.id instead.
    const { data: classRecord } = await supabase
      .from('classes')
      .select('id, course_code')
      .eq('id', enrollment.class_id)
      .maybeSingle();

    let courseType: 'course' | 'program' | null = null;
    if (classRecord?.course_code) {
      const { data: course } = await supabase
        .from('courses')
        .select('type')
        .eq('course_code', classRecord.course_code)
        .maybeSingle();
      courseType = (course as any)?.type === 'program' ? 'program' : 'course';
    }
    const classType: 'course' | 'program' = courseType === 'program' ? 'program' : 'course';

    let stripeCustomerId: string | null = null;
    if (replacementInvoices.length > 0) {
      const { data: student } = await supabase
        .from('students')
        .select('stripe_customer_id')
        .eq('id', enrollment.student_id)
        .maybeSingle();
      stripeCustomerId = student?.stripe_customer_id ?? null;
      if (!stripeCustomerId) {
        // Unlike registration time, this is an explicit admin action on an
        // enrollment that already went through registration — there's no
        // legitimate reason for a Stripe customer to be missing here, so fail
        // loudly rather than silently creating an invoice-less transaction row.
        return NextResponse.json({ success: false, error: 'Cannot reissue invoices: student has no Stripe customer on file' }, { status: 400 });
      }
    }

    let nextInvoiceNumber = await getNextTransactionInvoiceNumber();
    const created = [];
    for (const item of replacementInvoices) {
      const description = payInFull ? 'Pay in Full' : 'Revised Invoice';
      const invoice = await createAndFinalizeStripeInvoice({
        customerId: stripeCustomerId!,
        amountCents: item.amountCents,
        dueDate: item.dueDate,
        description,
        metadata: { enrollment_id: enrollment.id },
      });

      let transaction;
      try {
        transaction = await createTransaction({
          enrollmentId: enrollment.id,
          studentId: enrollment.student_id,
          classId: enrollment.class_id,
          classType,
          transactionType: payInFull ? 'pay_in_full' : 'custom',
          quantity: 1,
          stripePaymentIntentId: null,
          stripeInvoiceId: invoice.stripeInvoiceId,
          stripeHostedInvoiceUrl: invoice.hostedInvoiceUrl,
          transactionStatus: 'pending',
          paymentDate: null,
          dueDate: new Date(item.dueDate).toISOString(),
          amountDue: item.amountCents,
          amountPaid: null,
          invoiceNumber: nextInvoiceNumber,
        });
      } catch (err) {
        await voidStripeInvoice(invoice.stripeInvoiceId).catch((voidErr) =>
          console.error('[enrollments/void-and-reissue] Failed to compensate-void orphaned replacement invoice', invoice.stripeInvoiceId, voidErr)
        );
        throw err;
      }
      created.push(transaction);
      nextInvoiceNumber++;
    }

    return NextResponse.json({
      success: true,
      voidedCount: openTransactions.length,
      createdCount: created.length,
    });
  } catch (err: any) {
    console.error('[enrollments/void-and-reissue] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to void and reissue' }, { status: 500 });
  }
}
