import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';
import { createTransaction, getNextTransactionInvoiceNumber } from '@/lib/enrollments';
import { createAndFinalizeStripeInvoice, voidStripeInvoice } from '@/lib/stripe-invoices';
import { logServerError } from '@/lib/error-reporting/log-server-error';

export type AdminTransaction = {
  id: string;
  enrollment_id: string | null;
  invoice_number: string | null;
  student_id: string | null;
  class_id: string | null;
  transaction_type: 'registration_fee' | 'tuition_a' | 'tuition_b' | null;
  quantity: number | null;
  amount_due: number | null;
  transaction_status: string | null;
  due_date: string | null;
  student_name?: string;
  student_email?: string | null;
  class_id_display?: string;
  payout_id?: string | null;
  payout_date?: string | null;
  reconciled?: boolean;
  reconciliation_date?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
  stripe_payment_intent_id?: string | null;
  discount_percent?: number | null;
  original_amount_due?: number | null;
};

export const runtime = 'nodejs';

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createSupabaseAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { admin, error: adminError } = await getCurrentAdmin(user.id);
  if (adminError || !admin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase };
}

const typeOrder: Record<string, number> = {
  registration_fee: 1,
  tuition_a: 2,
  tuition_b: 3,
};

/**
 * GET /api/admin/transactions
 * Admin-only transaction list (bypasses RLS via service role).
 *
 * Query params:
 * - enrollmentId: filter to one enrollment
 * - studentId: filter to one student
 * - withPayoutId: "true" to only return rows with payout_id set
 */
export async function GET(request: NextRequest) {
  try {
    const verified = await verifyAdmin(request);
    if ('error' in verified && verified.error) {
      return verified.error;
    }

    const { supabase } = verified as { supabase: ReturnType<typeof createSupabaseAdminClient> };
    const searchParams = request.nextUrl.searchParams;
    const enrollmentId = searchParams.get('enrollmentId');
    const studentId = searchParams.get('studentId');
    const withPayoutId = searchParams.get('withPayoutId') === 'true';

    let query = supabase
      .from('transactions')
      .select(`
        *,
        students (
          id,
          full_name
        ),
        classes (
          id,
          class_id
        )
      `);

    if (enrollmentId) {
      query = query.eq('enrollment_id', enrollmentId);
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (withPayoutId) {
      query = query.not('payout_id', 'is', null);
    }

    if (enrollmentId) {
      query = query.order('created_at', { ascending: true });
    } else if (withPayoutId) {
      query = query
        .order('payout_date', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('[admin/transactions] Query failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ transactions: [] });
    }

    const studentIds = [...new Set(data.map((t) => t.student_id).filter(Boolean))] as string[];
    const emailMap = new Map<string, string | null>();

    if (studentIds.length > 0 && !enrollmentId) {
      await Promise.all(
        studentIds.map(async (studentId) => {
          try {
            const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(studentId);
            if (!getUserError && authUser?.user) {
              emailMap.set(studentId, authUser.user.email ?? null);
            } else {
              emailMap.set(studentId, null);
            }
          } catch {
            emailMap.set(studentId, null);
          }
        })
      );
    }

    const transactions: AdminTransaction[] = data.map((transaction) => {
      const student = transaction.students as { id?: string; full_name?: string } | null;
      const classRecord = transaction.classes as { id?: string; class_id?: string } | null;

      return {
        id: transaction.id,
        enrollment_id: transaction.enrollment_id,
        invoice_number: transaction.invoice_number,
        student_id: transaction.student_id,
        class_id: transaction.class_id,
        transaction_type: transaction.transaction_type,
        quantity: transaction.quantity,
        amount_due: transaction.amount_due,
        transaction_status: transaction.transaction_status,
        due_date: transaction.due_date,
        student_name: student?.full_name || 'Unknown Student',
        student_email: enrollmentId
          ? null
          : transaction.student_id
            ? emailMap.get(transaction.student_id) ?? null
            : null,
        class_id_display: classRecord?.class_id || transaction.class_id || 'N/A',
        payout_id: transaction.payout_id || null,
        payout_date: transaction.payout_date || null,
        reconciled: transaction.reconciled || false,
        reconciliation_date: transaction.reconciliation_date || null,
        payment_date: transaction.payment_date || null,
        created_at: transaction.created_at || null,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id || null,
        discount_percent: transaction.discount_percent ?? null,
        original_amount_due: transaction.original_amount_due ?? null,
      };
    });

    if (enrollmentId) {
      transactions.sort((a, b) => {
        const aOrder = typeOrder[a.transaction_type || ''] || 999;
        const bOrder = typeOrder[b.transaction_type || ''] || 999;
        return aOrder - bOrder;
      });
    }

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
    console.error('[admin/transactions] Unexpected error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const INVOICE_TYPES = ['registration_fee', 'tuition_a', 'tuition_b', 'custom', 'pay_in_full'] as const;
type InvoiceType = (typeof INVOICE_TYPES)[number];

const INVOICE_DESCRIPTIONS: Record<InvoiceType, string> = {
  registration_fee: 'Registration Fee',
  tuition_a: 'First Tuition Payment',
  tuition_b: 'Second Tuition Payment',
  custom: 'Custom Invoice',
  pay_in_full: 'Pay in Full',
};

// Stripe requires a due_date strictly in the future; the margin covers the
// time between this check and the actual Stripe call (same as void-and-reissue).
const DUE_DATE_MARGIN_MS = 60 * 1000;
const MAX_TOTAL_CENTS = 99_999_999; // Stripe's per-line maximum
const MAX_QUANTITY = 100;

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * POST /api/admin/transactions
 * Admin-only: create a REAL Stripe invoice (send_invoice, finalized, not
 * emailed) plus its `transactions` row for an existing enrollment.
 *
 * Body: { studentId, classId, transactionType, amountDueCents, quantity?, dueDate }
 * amountDueCents is the per-unit amount (stored pre-quantity); Stripe is
 * charged amountDueCents * quantity.
 *
 * Everything that can be checked is checked BEFORE Stripe is touched. If the DB
 * insert fails after Stripe succeeded, the new Stripe invoice is voided.
 */
export async function POST(request: NextRequest) {
  try {
    const verified = await verifyAdmin(request);
    if ('error' in verified && verified.error) {
      return verified.error;
    }
    const { supabase } = verified as { supabase: ReturnType<typeof createSupabaseAdminClient> };

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return fail('Invalid request body', 400);
    }

    const studentId = typeof body.studentId === 'string' ? body.studentId : '';
    const classId = typeof body.classId === 'string' ? body.classId : '';
    const transactionType = body.transactionType as InvoiceType;
    const amountDueCents = body.amountDueCents;
    const quantity = body.quantity === undefined || body.quantity === null ? 1 : body.quantity;
    const dueDate = typeof body.dueDate === 'string' ? body.dueDate : '';

    // ---- Pre-flight: input validation (no I/O) ----
    if (!studentId || !classId) {
      return fail('studentId and classId are required', 400);
    }
    if (!INVOICE_TYPES.includes(transactionType)) {
      return fail('Invalid transactionType', 400);
    }
    if (typeof amountDueCents !== 'number' || !Number.isInteger(amountDueCents) || amountDueCents <= 0) {
      return fail('amountDueCents must be a positive integer number of cents', 400);
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return fail(`quantity must be a whole number between 1 and ${MAX_QUANTITY}`, 400);
    }
    const totalCents = amountDueCents * quantity;
    if (totalCents > MAX_TOTAL_CENTS) {
      return fail('Invoice total is too large', 400);
    }
    const dueMs = new Date(dueDate).getTime();
    if (!dueDate || Number.isNaN(dueMs)) {
      return fail('A valid dueDate is required', 400);
    }
    if (dueMs <= Date.now() + DUE_DATE_MARGIN_MS) {
      return fail('Due date must be in the future (Stripe requires a future due date).', 400);
    }

    // ---- Pre-flight: database state (read-only) ----
    const { data: classRecord, error: classError } = await supabase
      .from('classes')
      .select('id, course_code, deleted_at')
      .eq('id', classId)
      .maybeSingle();
    if (classError) return fail(`Failed to look up class: ${classError.message}`, 500);
    if (!classRecord || classRecord.deleted_at) {
      return fail('Class not found or has been deleted', 404);
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, stripe_customer_id, deleted_at')
      .eq('id', studentId)
      .maybeSingle();
    if (studentError) return fail(`Failed to look up student: ${studentError.message}`, 500);
    if (!student || student.deleted_at) {
      return fail('Student not found or has been deleted', 404);
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, enrollment_status')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .neq('enrollment_status', 'removed')
      .order('enrolled_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (enrollmentError) return fail(`Failed to look up enrollment: ${enrollmentError.message}`, 500);
    if (!enrollment) {
      return fail('This student has no active enrollment in that class. Enroll the student first, then create the invoice.', 400);
    }

    const stripeCustomerId = student.stripe_customer_id as string | null;
    if (!stripeCustomerId) {
      return fail('This student has no Stripe customer on file, so an invoice cannot be created.', 400);
    }

    let classType: 'course' | 'program' = 'course';
    if (classRecord.course_code) {
      const { data: course } = await supabase
        .from('courses')
        .select('type')
        .eq('course_code', classRecord.course_code)
        .maybeSingle();
      classType = (course as { type?: string } | null)?.type === 'program' ? 'program' : 'course';
    }

    // Read-only; resolving it here means a failure surfaces before Stripe.
    const invoiceNumber = await getNextTransactionInvoiceNumber();

    // ---- Pre-flight passed. Stripe, then DB. ----
    let invoice: { stripeInvoiceId: string; hostedInvoiceUrl: string | null };
    try {
      invoice = await createAndFinalizeStripeInvoice({
        customerId: stripeCustomerId,
        amountCents: totalCents,
        dueDate: new Date(dueMs).toISOString(),
        description: INVOICE_DESCRIPTIONS[transactionType],
        metadata: { enrollment_id: enrollment.id, transaction_type: transactionType },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe error';
      console.error('[admin/transactions] Stripe invoice creation failed:', err);
      return fail(`Could not create the Stripe invoice (${message}). Nothing was saved.`, 502);
    }

    try {
      const transaction = await createTransaction({
        enrollmentId: enrollment.id,
        studentId,
        classId,
        classType,
        transactionType,
        quantity,
        stripePaymentIntentId: null,
        stripeInvoiceId: invoice.stripeInvoiceId,
        stripeHostedInvoiceUrl: invoice.hostedInvoiceUrl,
        transactionStatus: 'pending',
        paymentDate: null,
        dueDate: new Date(dueMs).toISOString(),
        amountDue: amountDueCents,
        amountPaid: null,
        invoiceNumber,
      });
      return NextResponse.json({ success: true, transaction });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database error';
      console.error('[admin/transactions] DB insert failed after Stripe invoice created:', err);
      let voided = true;
      try {
        await voidStripeInvoice(invoice.stripeInvoiceId);
      } catch (voidErr) {
        voided = false;
        console.error('[admin/transactions] Failed to compensate-void orphaned invoice', invoice.stripeInvoiceId, voidErr);
        void logServerError({
          message: `Orphaned Stripe invoice ${invoice.stripeInvoiceId}: DB insert failed and void failed. Void it manually in Stripe.`,
          stack: err instanceof Error ? err.stack : undefined,
          requestUrl: new URL(request.url).pathname,
          statusCode: 500,
          context: { route: 'admin/transactions POST', stripeInvoiceId: invoice.stripeInvoiceId, studentId, classId },
        });
      }
      return fail(
        voided
          ? `The invoice could not be saved (${message}). The Stripe invoice was voided; nothing was created. Please retry.`
          : `The invoice could not be saved (${message}) and the Stripe invoice ${invoice.stripeInvoiceId} could not be voided automatically. Please void it in Stripe.`,
        500,
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice';
    console.error('[admin/transactions] Unexpected POST error:', error);
    return fail(message, 500);
  }
}
