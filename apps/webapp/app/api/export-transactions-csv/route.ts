import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';

export const runtime = 'nodejs';

/**
 * Export transactions to CSV
 * GET /api/export-transactions-csv
 * 
 * Queries transactions where downloaded = false, joins with students and classes,
 * generates CSV, marks transactions as downloaded = true, and returns CSV file.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[export-transactions-csv] Starting CSV export...');
    
    const supabase = createSupabaseAdminClient();
    console.log('[export-transactions-csv] Supabase client created');

    // Query transactions where downloaded = false, with joins to students and classes
    // First, get transactions
    const { data: transactions, error: queryError } = await supabase
      .from('transactions')
      .select('*')
      .eq('downloaded', false)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('[export-transactions-csv] Query failed:', {
        error: queryError.message,
        code: queryError.code,
        details: queryError.details,
        hint: queryError.hint,
      });
      
      // If column doesn't exist, try without the filter
      if (queryError.code === '42703' || queryError.message.includes('column "downloaded" does not exist')) {
        console.log('[export-transactions-csv] downloaded column does not exist, querying all transactions');
        
        const { data: allTransactions, error: allError } = await supabase
          .from('transactions')
          .select('*')
          .is('downloaded', null)
          .order('created_at', { ascending: true });

        if (allError) {
          return NextResponse.json(
            {
              success: false,
              error: allError.message,
              code: allError.code,
              details: allError.details,
              hint: allError.hint,
            },
            { status: 500 }
          );
        }

        if (!allTransactions || allTransactions.length === 0) {
          return NextResponse.json({
            success: false,
            message: 'No new invoices to download',
            count: 0,
          }, { status: 200 });
        }

        return await processTransactions(allTransactions, supabase);
      }
      
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

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No new invoices to download',
        count: 0,
      }, { status: 200 });
    }

    console.log('[export-transactions-csv] Found', transactions.length, 'transactions to export');

    return await processTransactions(transactions, supabase);
  } catch (error: any) {
    console.error('[export-transactions-csv] Unexpected error:', {
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

async function processTransactions(transactions: any[], supabase: any): Promise<NextResponse> {
  // Fetch related data for all transactions
  const studentIds = [...new Set(transactions.map(t => t.student_id).filter(Boolean))];
  const classIds = [...new Set(transactions.map(t => t.class_id).filter(Boolean))];

  // Fetch students (only if we have student IDs)
  let students: any[] = [];
  if (studentIds.length > 0) {
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, full_name')
      .in('id', studentIds);
    students = studentsData || [];
  }

  // Fetch classes (only if we have class IDs)
  let classes: any[] = [];
  if (classIds.length > 0) {
    const { data: classesData } = await supabase
      .from('classes')
      .select('id, class_id, course_code, class_name, class_start_date')
      .in('id', classIds);
    classes = classesData || [];
  }

  // Create lookup maps
  const studentsMap = new Map(students.map(s => [s.id, s]));
  const classesMap = new Map(classes.map(c => [c.id, c]));
  // CSV Headers
  const headers = [
    'InvoiceNo',
    'Customer',
    'InvoiceDate',
    'DueDate',
    'Terms',
    'Location',
    'Memo',
    'Item(Product/Service)',
    'ItemDescription',
    'ItemQuantity',
    'ItemRate',
    'ItemAmount',
    'Taxable',
    'TaxRate',
    'Service Date',
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

  // Helper function to format amount (convert cents to dollars)
  function formatAmount(cents: number | null): string {
    if (cents === null || cents === undefined) {
      return '0.00';
    }
    return (cents / 100).toFixed(2);
  }

  // Helper function to format date from ISO string to MMDDYY
  function formatDateMMDDYY(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}${day}${year}`;
    } catch (error) {
      return '';
    }
  }

  // Helper function to format date for CSV (M/D/YYYY format)
  function formatDateForCSV(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return '';
    }
  }

  // Helper function to format date as "Month Day, Year" (e.g., "January 15, 2024")
  function formatDateMonthDayYear(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch (error) {
      return '';
    }
  }

  // Determine item type based on transaction_type
  function getItemType(transactionType: string | null): string {
    if (transactionType === 'registration_fee') {
      return 'Registration Fee';
    } else if (transactionType === 'tuition_a' || transactionType === 'tuition_b') {
      return 'Tuition';
    }
    return 'Registration Fee'; // default
  }

  // Find date range for filename
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  // Build CSV rows
  const csvRows = [headers.join(',')];
  const transactionIds: string[] = [];

  for (const transaction of transactions) {
    transactionIds.push(transaction.id);

    const student = studentsMap.get(transaction.student_id);
    const classData = classesMap.get(transaction.class_id);

    const studentName = student?.full_name || '';
    const classId = classData?.class_id || '';
    const courseCode = classData?.course_code || '';
    const className = classData?.class_name || '';
    const classStartDate = classData?.class_start_date || '';

    // Build memo: class_id only
    const memo = classId || '';

    // Get item type
    const itemType = getItemType(transaction.transaction_type);

    // Build item description: [Registration Fee/Tuition] for class.class_name [starting on classes.class_start_date]
    // For tuition_a, replace "Tuition for" with "First payment for"
    // For tuition_b, replace "Tuition for" with "Final payment for"
    let itemDescription = itemType;
    if (transaction.transaction_type === 'tuition_a') {
      itemDescription = 'First payment';
    } else if (transaction.transaction_type === 'tuition_b') {
      itemDescription = 'Final payment';
    }
    
    if (className) {
      itemDescription += ` for ${className}`;
    }
    if (classStartDate) {
      const formattedStartDate = formatDateMonthDayYear(classStartDate);
      itemDescription += ` starting on ${formattedStartDate}`;
    }

    // Format amounts
    const amountDue = transaction.amount_due || 0;
    const itemAmount = formatAmount(amountDue);
    // Item rate should pull from transactions.quantity (should be 1 or 0.5)
    const quantity = transaction.quantity || 1;
    const itemRate = String(quantity);

    // Format dates
    const invoiceDate = formatDateForCSV(transaction.created_at);
    const dueDate = formatDateForCSV(transaction.due_date);
    const serviceDate = formatDateForCSV(classStartDate);

    // Track date range
    if (transaction.created_at) {
      const date = new Date(transaction.created_at);
      if (!earliestDate || date < earliestDate) {
        earliestDate = date;
      }
      if (!latestDate || date > latestDate) {
        latestDate = date;
      }
    }

    const row = [
      escapeCsvField(transaction.invoice_number), // InvoiceNo
      escapeCsvField(studentName),                // Customer
      escapeCsvField(invoiceDate),                 // InvoiceDate
      escapeCsvField(dueDate),                     // DueDate
      escapeCsvField(''),                          // Terms (blank)
      escapeCsvField(''),                          // Location (blank)
      escapeCsvField(memo),                        // Memo
      escapeCsvField(itemType),                     // Item(Product/Service)
      escapeCsvField(itemDescription),              // ItemDescription
      escapeCsvField('1'),                         // ItemQuantity
      escapeCsvField(itemRate),                    // ItemRate
      escapeCsvField(itemAmount),                   // ItemAmount
      escapeCsvField('N'),                         // Taxable
      escapeCsvField(''),                          // TaxRate (blank)
      escapeCsvField(serviceDate),                  // Service Date
    ];
    csvRows.push(row.join(','));
  }

  const csvContent = csvRows.join('\n');

  // Generate filename with date range
  const dateStart = earliestDate ? formatDateMMDDYY(earliestDate.toISOString()) : '010101';
  const dateEnd = latestDate ? formatDateMMDDYY(latestDate.toISOString()) : '010101';
  const filename = `midwestea-invoices-${dateStart}-${dateEnd}.csv`;

  console.log('[export-transactions-csv] ✅ CSV generated:', {
    rowCount: csvRows.length - 1, // Exclude header
    size: csvContent.length,
    filename,
    transactionIds: transactionIds.length,
  });

  // Mark transactions as downloaded = true
  if (transactionIds.length > 0) {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ downloaded: true })
      .in('id', transactionIds);

    if (updateError) {
      console.error('[export-transactions-csv] Failed to mark transactions as downloaded:', updateError);
      // Continue anyway - CSV is already generated
    } else {
      console.log('[export-transactions-csv] ✅ Marked', transactionIds.length, 'transactions as downloaded');
    }
  }

  // Return CSV as downloadable file
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

