import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * Simple test endpoint to insert a row into invoices_to_import table
 * GET /api/test-invoice-insert
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[test-invoice-insert] Starting test insert...');
    
    const supabase = createSupabaseAdminClient();
    console.log('[test-invoice-insert] Supabase client created');

    // Get the next invoice number
    const { data: maxInvoice, error: maxError } = await supabase
      .from('invoices_to_import')
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single();

    let nextInvoiceNumber = 100001;
    if (!maxError && maxInvoice?.invoice_number) {
      nextInvoiceNumber = maxInvoice.invoice_number + 1;
      console.log('[test-invoice-insert] Found max invoice number:', maxInvoice.invoice_number);
    } else {
      console.log('[test-invoice-insert] No existing invoices, starting at:', nextInvoiceNumber);
      if (maxError && maxError.code !== 'PGRST116') {
        console.warn('[test-invoice-insert] Error getting max invoice (non-fatal):', maxError.message);
      }
    }

    // Create test invoice data
    const paymentDate = new Date();
    const invoiceDate = paymentDate.toISOString().split('T')[0];
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const testInvoice = {
      invoice_number: nextInvoiceNumber,
      customer_email: 'test@example.com',
      invoice_date: invoiceDate,
      due_date: dueDateStr,
      item: 'TEST:direct-insert:registration',
      memo: 'Direct test insert from API endpoint',
      item_amount: 10000, // $100.00 in cents
      item_quantity: 1,
      item_rate: 0.5,
      payment_id: null,
      class_id: null,
      invoice_sequence: 1,
      category: 'TEST',
      subcategory: 'direct-insert',
    };

    console.log('[test-invoice-insert] Attempting to insert:', testInvoice);

    // Insert into invoices_to_import table
    const { data: insertedInvoice, error: insertError } = await supabase
      .from('invoices_to_import')
      .insert([testInvoice])
      .select()
      .single();

    if (insertError) {
      console.error('[test-invoice-insert] Insert failed:', {
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
        { status: 500 }
      );
    }

    console.log('[test-invoice-insert] ✅ Successfully inserted invoice:', {
      id: insertedInvoice.id,
      invoice_number: insertedInvoice.invoice_number,
    });

    return NextResponse.json({
      success: true,
      message: 'Test invoice inserted successfully',
      invoice: {
        id: insertedInvoice.id,
        invoice_number: insertedInvoice.invoice_number,
        customer_email: insertedInvoice.customer_email,
        invoice_date: insertedInvoice.invoice_date,
        due_date: insertedInvoice.due_date,
        item: insertedInvoice.item,
        item_amount: insertedInvoice.item_amount,
      },
    });
  } catch (error: any) {
    console.error('[test-invoice-insert] Unexpected error:', {
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







