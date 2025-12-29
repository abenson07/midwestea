import { createSupabaseAdminClient } from '@midwestea/utils';
import type { Class } from '@midwestea/types';

export interface InvoiceToImport {
  invoice_number: number;
  customer_email: string;
  invoice_date: string; // ISO date string
  due_date: string; // ISO date string
  item: string;
  memo: string;
  item_amount: number; // Amount in cents
  item_quantity: number;
  item_rate: number;
  payment_id: string;
  class_id: string;
  invoice_sequence: number; // 1 or 2
  category: string | null; // Course code
  subcategory: string | null; // Class ID
}

/**
 * Get the next invoice number from the sequence
 */
async function getNextInvoiceNumber(): Promise<number> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices.ts:24',message:'getNextInvoiceNumber called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const supabase = createSupabaseAdminClient();
  
  // Use a database function to get the next invoice number
  // We'll use a simple approach: get the max invoice number and add 1, or start at 100001
  const { data, error } = await supabase
    .from('invoices_to_import')
    .select('invoice_number')
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices.ts:35',message:'getNextInvoiceNumber query result',data:{hasError:!!error,errorCode:error?.code,errorMessage:error?.message,hasData:!!data,currentMax:data?.invoice_number},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" which is fine if table is empty
    throw new Error(`Failed to get next invoice number: ${error.message}`);
  }

  if (data && data.invoice_number) {
    return data.invoice_number + 1;
  }

  // Start at 100001 if no invoices exist
  return 100001;
}

/**
 * Create invoice records for a registration fee payment
 * Creates 2 invoices (invoice 1 and invoice 2) as per the old QuickBooks approach
 */
export async function createRegistrationFeeInvoices(
  paymentId: string,
  classRecord: Class,
  customerEmail: string,
  paymentDate: Date
): Promise<InvoiceToImport[]> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices.ts:53',message:'createRegistrationFeeInvoices called',data:{paymentId,classId:classRecord.id,classIdText:classRecord.class_id,customerEmail,price:classRecord.price,registrationFee:classRecord.registration_fee},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const supabase = createSupabaseAdminClient();

  // Get invoice due dates from class (use payment date + 30 days as fallback)
  const invoice1DueDate = (classRecord as any)['invoice_1_due_date'];
  const invoice2DueDate = (classRecord as any)['invoice_2_due_date'];
  
  // Fallback to 30 days and 60 days from payment date if not set
  const fallbackDate1 = new Date(paymentDate);
  fallbackDate1.setDate(fallbackDate1.getDate() + 30);
  const fallbackDate2 = new Date(paymentDate);
  fallbackDate2.setDate(fallbackDate2.getDate() + 60);

  const dueDate1 = invoice1DueDate || fallbackDate1;
  const dueDate2 = invoice2DueDate || fallbackDate2;

  console.log('[invoices] Invoice due dates:', {
    invoice1DueDate,
    invoice2DueDate,
    usingFallback: !invoice1DueDate || !invoice2DueDate,
    classId: classRecord.class_id,
  });

  // Use price or registration_fee, default to 0 if neither is set
  const priceCents = classRecord.price || classRecord.registration_fee || 0;

  // Get the base invoice number (we'll create 2 separate invoices)
  const baseInvoiceNumber = await getNextInvoiceNumber();

  // Format dates
  const invoiceDateStr = paymentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  const dueDate1Str = typeof dueDate1 === 'string' 
    ? dueDate1.split('T')[0] 
    : new Date(dueDate1).toISOString().split('T')[0];
  const dueDate2Str = typeof dueDate2 === 'string'
    ? dueDate2.split('T')[0]
    : new Date(dueDate2).toISOString().split('T')[0];

  // Build item string: Course_code:classID:registration
  const courseCode = classRecord.course_code || '';
  const classId = classRecord.class_id || '';
  const item = `${courseCode}:${classId}:registration`;

  // Build memo: Registration, Class Name, Course Code, ClassID
  const memoParts = [
    'Registration',
    classRecord.class_name || '',
    classRecord.course_code || '',
    classRecord.class_id || '',
  ].filter(Boolean);
  const memo = memoParts.join(', ');

  // Split price in half for the two invoices
  const amountPerInvoice = Math.floor(priceCents / 2);

  // Set category (course_code) and subcategory (class_id)
  const category = classRecord.course_code || null;
  const subcategory = classRecord.class_id || null;

  // Create two invoice records (separate invoices with consecutive numbers)
  const invoicesToInsert: InvoiceToImport[] = [
    {
      invoice_number: baseInvoiceNumber,
      customer_email: customerEmail,
      invoice_date: invoiceDateStr,
      due_date: dueDate1Str,
      item: item,
      memo: memo,
      item_amount: amountPerInvoice,
      item_quantity: 1,
      item_rate: 0.5,
      payment_id: paymentId,
      class_id: classRecord.id,
      invoice_sequence: 1,
      category: category,
      subcategory: subcategory,
    },
    {
      invoice_number: baseInvoiceNumber + 1,
      customer_email: customerEmail,
      invoice_date: invoiceDateStr,
      due_date: dueDate2Str,
      item: item,
      memo: memo,
      item_amount: amountPerInvoice,
      item_quantity: 1,
      item_rate: 0.5,
      payment_id: paymentId,
      class_id: classRecord.id,
      invoice_sequence: 2,
      category: category,
      subcategory: subcategory,
    },
  ];

  console.log('[invoices] Inserting invoice records:', {
    count: invoicesToInsert.length,
    invoiceNumbers: invoicesToInsert.map(i => i.invoice_number),
    paymentId,
  });

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices.ts:159',message:'About to insert invoices to database',data:{count:invoicesToInsert.length,invoiceNumbers:invoicesToInsert.map(i=>i.invoice_number),paymentId,classId:invoicesToInsert[0].class_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  const { data: insertedInvoices, error } = await supabase
    .from('invoices_to_import')
    .insert(invoicesToInsert)
    .select();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices.ts:164',message:'Database insert result',data:{hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details,errorHint:error?.hint,insertedCount:insertedInvoices?.length,insertedInvoiceNumbers:insertedInvoices?.map(i=>i.invoice_number)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (error) {
    console.error('[invoices] Database error:', {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Failed to create invoice records: ${error.message} (code: ${error.code})`);
  }

  if (!insertedInvoices || insertedInvoices.length !== 2) {
    console.error('[invoices] Unexpected result:', {
      expected: 2,
      actual: insertedInvoices?.length || 0,
      data: insertedInvoices,
    });
    throw new Error(`Failed to create invoice records: expected 2, got ${insertedInvoices?.length || 0}`);
  }

  console.log('[invoices] Successfully inserted invoice records:', {
    count: insertedInvoices.length,
    invoiceNumbers: insertedInvoices.map(i => i.invoice_number),
  });

  return insertedInvoices.map(inv => ({
    invoice_number: inv.invoice_number,
    customer_email: inv.customer_email,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    item: inv.item,
    memo: inv.memo || '',
    item_amount: inv.item_amount,
    item_quantity: inv.item_quantity,
    item_rate: inv.item_rate,
    payment_id: inv.payment_id,
    class_id: inv.class_id,
    invoice_sequence: inv.invoice_sequence,
    category: inv.category || null,
    subcategory: inv.subcategory || null,
  })) as InvoiceToImport[];
}

