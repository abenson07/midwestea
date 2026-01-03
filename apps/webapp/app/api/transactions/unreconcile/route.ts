import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

/**
 * POST /api/transactions/unreconcile
 * Undo reconciliation for a transaction (set reconciled = false)
 */
export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Update transaction to set reconciled = false and clear reconciliation_date
    const { error } = await supabase
      .from('transactions')
      .update({
        reconciled: false,
        reconciliation_date: null,
      })
      .eq('id', transactionId);

    if (error) {
      console.error('[unreconcile] Error updating transaction:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[unreconcile] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to undo reconciliation' },
      { status: 500 }
    );
  }
}

