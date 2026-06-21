import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import { getCurrentAdmin } from '@/lib/logging';

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
