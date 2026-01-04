import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * Reconcile a transaction
 * POST /api/transactions/reconcile
 * 
 * Body: { transactionId: string }
 * 
 * Marks a transaction as reconciled by setting:
 * - reconciled = true
 * - reconciliation_date = NOW()
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'transactionId is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('[reconcile] Reconciling transaction:', transactionId);

    const supabase = createSupabaseAdminClient();

    // Update transaction to mark as reconciled
    const { data, error } = await supabase
      .from('transactions')
      .update({
        reconciled: true,
        reconciliation_date: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select('id')
      .single();

    if (error) {
      console.error('[reconcile] Error updating transaction:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    console.log('[reconcile] Transaction reconciled successfully:', transactionId);

    return NextResponse.json({
      success: true,
      transactionId: data.id,
    });
  } catch (error: any) {
    console.error('[reconcile] Unexpected error:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reconcile transaction',
      },
      { status: 500 }
    );
  }
}



