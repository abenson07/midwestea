import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * Export invoices_to_import table to CSV
 * GET /api/export-invoices-csv
 * 
 * Returns a CSV file with the following columns:
 * InvoiceNo, Customer, InvoiceDate, DueDate, Item, ItemDescription, ItemQuantity, ItemRate, ItemAmount
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[export-invoices-csv] Starting CSV export...');
    
    const supabase = createSupabaseAdminClient();
    console.log('[export-invoices-csv] Supabase client created');

    // Query all invoices from invoices_to_import table
    const { data: invoices, error: queryError } = await supabase
      .from('invoices_to_import')
      .select('*')
      .order('invoice_number', { ascending: true });

    if (queryError) {
      console.error('[export-invoices-csv] Query failed:', {
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
        success: false,
        message: 'No invoices found in table',
        count: 0,
      });
    }

    console.log('[export-invoices-csv] Found', invoices.length, 'invoices to export');

    // CSV Headers (matching user's specification)
    const headers = [
      'InvoiceNo',
      'Customer',
      'InvoiceDate',
      'DueDate',
      'Item',
      'ItemDescription',
      'ItemQuantity',
      'ItemRate',
      'ItemAmount',
      'Taxable',
    ];

    // Helper function to escape CSV field values
    function escapeCsvField(value: any): string {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }

    // Helper function to format amount (keep as cents, or convert to dollars based on QuickBooks format)
    // QuickBooks typically expects amounts in dollars, but check your sample CSV format
    function formatAmount(cents: number): string {
      // Convert cents to dollars for QuickBooks
      return (cents / 100).toFixed(2);
    }

    // Helper function to format date from YYYY-MM-DD to M/D/YYYY
    function formatDate(dateString: string): string {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      } catch (error) {
        // If date parsing fails, return original string
        return dateString;
      }
    }

    // Build CSV rows
    const csvRows = [headers.join(',')];

    for (const invoice of invoices) {
      const row = [
        escapeCsvField(invoice.invoice_number),           // InvoiceNo
        escapeCsvField(invoice.customer_email),          // Customer
        escapeCsvField(formatDate(invoice.invoice_date)), // InvoiceDate (M/D/YYYY format)
        escapeCsvField(formatDate(invoice.due_date)),     // DueDate (M/D/YYYY format)
        escapeCsvField('Registration'),                   // Item (hardcoded as "Registration")
        escapeCsvField(invoice.subcategory || invoice.class_id || ''), // ItemDescription (use subcategory/class_id)
        escapeCsvField(invoice.item_quantity),           // ItemQuantity
        escapeCsvField(invoice.item_rate),               // ItemRate
        escapeCsvField(formatAmount(invoice.item_amount)), // ItemAmount (in dollars)
        escapeCsvField('N'),                             // Taxable (hardcoded as "N")
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    console.log('[export-invoices-csv] ✅ CSV generated:', {
      rowCount: csvRows.length - 1, // Exclude header
      size: csvContent.length,
    });

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invoices_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('[export-invoices-csv] Unexpected error:', {
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

