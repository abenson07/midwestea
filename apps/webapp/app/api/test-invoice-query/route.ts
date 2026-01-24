import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * Simple test endpoint to query the last transaction from invoices_to_import table
 * GET /api/test-invoice-query
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[test-invoice-query] Querying last invoice...');
    
    const supabase = createSupabaseAdminClient();
    console.log('[test-invoice-query] Supabase client created');

    // Query for the most recent invoice (by created_at)
    const { data: invoices, error: queryError } = await supabase
      .from('invoices_to_import')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10); // Get last 10 for context

    if (queryError) {
      console.error('[test-invoice-query] Query failed:', {
        error: queryError.message,
        code: queryError.code,
        details: queryError.details,
        hint: queryError.hint,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: queryError.message,
          code: queryError.code,
          details: queryError.details,
          hint: queryError.hint,
        },
        { status: 500 }
      );
    }

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No invoices found in table',
        count: 0,
        invoices: [],
      });
    }

    const lastInvoice = invoices[0];
    console.log('[test-invoice-query] ✅ Found invoices:', {
      total: invoices.length,
      lastInvoiceNumber: lastInvoice.invoice_number,
      lastInvoiceId: lastInvoice.id,
    });

    return NextResponse.json({
      success: true,
      message: `Found ${invoices.length} invoice(s)`,
      count: invoices.length,
      lastInvoice: {
        id: lastInvoice.id,
        invoice_number: lastInvoice.invoice_number,
        customer_email: lastInvoice.customer_email,
        invoice_date: lastInvoice.invoice_date,
        due_date: lastInvoice.due_date,
        item: lastInvoice.item,
        memo: lastInvoice.memo,
        item_amount: lastInvoice.item_amount,
        item_quantity: lastInvoice.item_quantity,
        item_rate: lastInvoice.item_rate,
        payment_id: lastInvoice.payment_id,
        class_id: lastInvoice.class_id,
        invoice_sequence: lastInvoice.invoice_sequence,
        category: lastInvoice.category,
        subcategory: lastInvoice.subcategory,
        created_at: lastInvoice.created_at,
      },
      // Also return all recent invoices for context
      recentInvoices: invoices.map(inv => ({
        invoice_number: inv.invoice_number,
        customer_email: inv.customer_email,
        item: inv.item,
        item_amount: inv.item_amount,
        created_at: inv.created_at,
      })),
    });
  } catch (error: any) {
    console.error('[test-invoice-query] Unexpected error:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}







