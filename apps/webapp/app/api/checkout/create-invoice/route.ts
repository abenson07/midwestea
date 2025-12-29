import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import {
  getOrCreateCustomer,
  getOrCreateItem,
  findOrCreateCategory,
  findOrCreateSubcategory,
  createInvoice,
  getInvoice,
  sendInvoice,
  getInvoicePaymentUrl,
  type QuickBooksInvoice,
} from '@/lib/quickbooks';

/**
 * Create a QuickBooks invoice for checkout
 * 
 * POST /api/checkout/create-invoice
 * Body: { email: string, classId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, classId } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch class data from database
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', classId)
      .maybeSingle();

    if (classError) {
      console.error('Error fetching class:', classError);
      return NextResponse.json(
        { error: 'Database error while fetching class' },
        { status: 500 }
      );
    }

    if (!classData) {
      return NextResponse.json(
        { error: `Class with ID "${classId}" not found` },
        { status: 404 }
      );
    }

    // Determine amount and SKU based on registration fee
    const hasRegistrationFee = !!(classData.registration_fee && classData.registration_fee > 0);
    const amount = hasRegistrationFee 
      ? (classData.registration_fee as number)
      : (classData.price as number || 0);
    
    const skuName = hasRegistrationFee ? 'registration fee' : 'tuition';

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Class has no valid price or registration fee' },
        { status: 400 }
      );
    }

    // Get or create QuickBooks customer
    let customer;
    try {
      customer = await getOrCreateCustomer(email);
    } catch (error: any) {
      console.error('Error with QuickBooks customer:', error);
      return NextResponse.json(
        { error: `Failed to get or create customer: ${error.message}` },
        { status: 500 }
      );
    }

    if (!customer.Id) {
      return NextResponse.json(
        { error: 'Customer created but missing ID' },
        { status: 500 }
      );
    }

    // Get or create the appropriate item (SKU)
    let item;
    try {
      item = await getOrCreateItem(skuName);
    } catch (error: any) {
      console.error('Error with QuickBooks item:', error);
      return NextResponse.json(
        { error: `Failed to get or create item: ${error.message}` },
        { status: 500 }
      );
    }

    if (!item.Id) {
      return NextResponse.json(
        { error: `Item "${skuName}" created but missing ID` },
        { status: 500 }
      );
    }

    // Get or create category (course_code)
    const courseCode = classData.course_code as string | null;
    let category = null;
    if (courseCode) {
      try {
        category = await findOrCreateCategory(courseCode);
      } catch (error: any) {
        console.warn('Error creating category:', error);
        // Continue without category if it fails
      }
    }

    // Get or create subcategory (class_id)
    let subcategory = null;
    try {
      subcategory = await findOrCreateSubcategory(classId, category?.Id);
    } catch (error: any) {
      console.warn('Error creating subcategory:', error);
      // Continue without subcategory if it fails
    }

    // Create invoice description
    const description = hasRegistrationFee
      ? `Registration Fee - ${classData.class_name || classId}`
      : `Tuition - ${classData.class_name || classId}`;

    // Create invoice with custom fields to store class_id for webhook processing
    const customFields = [
      { Name: 'ClassID', StringValue: classId },
      { Name: 'PaymentType', StringValue: skuName },
    ];

    // Create the invoice
    let invoice;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:148',message:'Before createInvoice call',data:{customerId:customer.Id,itemId:item.Id,amount,hasCategory:!!category?.Id,hasSubcategory:!!subcategory?.Id,customFieldsCount:customFields.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      invoice = await createInvoice(
        customer.Id,
        item.Id,
        amount,
        description,
        category?.Id,
        subcategory?.Id,
        customFields
      );
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:160',message:'After createInvoice call',data:{hasInvoice:!!invoice,invoiceId:invoice?.Id,hasSyncToken:!!invoice?.SyncToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:163',message:'Error in createInvoice',data:{error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error creating invoice:', error);
      return NextResponse.json(
        { error: `Failed to create invoice: ${error.message}` },
        { status: 500 }
      );
    }

    if (!invoice.Id) {
      return NextResponse.json(
        { error: 'Invoice created but missing ID' },
        { status: 500 }
      );
    }

    // Note: Invoice is already saved when created via POST - no need for separate save operation

    // Try to send invoice to generate share link (without actually emailing)
    // This may generate the InvoiceLink field
    if (invoice.SyncToken && customer.PrimaryEmailAddr?.Address) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:185',message:'Before sendInvoice to generate share link',data:{invoiceId:invoice.Id,email:customer.PrimaryEmailAddr.Address},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});
        // #endregion
        await sendInvoice(invoice.Id, invoice.SyncToken, customer.PrimaryEmailAddr.Address);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:189',message:'After sendInvoice',data:{invoiceId:invoice.Id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});
        // #endregion
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:192',message:'Error sending invoice (continuing)',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});
        // #endregion
        console.warn('Error sending invoice (continuing anyway):', error);
        // Continue even if send fails - may not be necessary for share link
      }
    }

    // Fetch invoice with share link (using minor version 65)
    let invoiceWithLink: QuickBooksInvoice;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:199',message:'Before getInvoice with share link',data:{invoiceId:invoice.Id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      invoiceWithLink = await getInvoice(invoice.Id, 'invoiceLink', 65);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:202',message:'After getInvoice with share link',data:{hasInvoiceLink:!!invoiceWithLink.InvoiceLink,hasPaymentLink:!!invoiceWithLink.PaymentLink,invoiceLink:invoiceWithLink.InvoiceLink},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:205',message:'Error fetching invoice with share link',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching invoice with share link:', error);
      // Fallback to original invoice if fetch fails
      invoiceWithLink = invoice;
    }

    // Get payment URL (prioritizes share link)
    const companyId = process.env.QUICKBOOKS_COMPANY_ID || '9341455971522574';
    const useSandbox = process.env.QUICKBOOKS_USE_SANDBOX !== 'false';
    
    let paymentUrl: string;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:200',message:'Before getInvoicePaymentUrl',data:{hasInvoiceLink:!!invoiceWithLink.InvoiceLink,hasPaymentLink:!!invoiceWithLink.PaymentLink},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      paymentUrl = getInvoicePaymentUrl(invoiceWithLink, companyId, useSandbox);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:203',message:'After getInvoicePaymentUrl',data:{paymentUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'create-invoice/route.ts:206',message:'Error getting payment URL',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('Error getting payment URL:', error);
      return NextResponse.json(
        { error: `Failed to get payment URL: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoiceId: invoice.Id,
      paymentUrl,
      invoice,
    });
  } catch (error: any) {
    console.error('Error in create-invoice API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

