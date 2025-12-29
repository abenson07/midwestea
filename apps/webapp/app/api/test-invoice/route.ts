import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, query } from '@/lib/quickbooks';

/**
 * Test endpoint to fetch invoice details by DocNumber
 * GET /api/test-invoice?docNumber=1043
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const docNumber = searchParams.get('docNumber');

    if (!docNumber) {
      return NextResponse.json(
        { error: 'DocNumber query parameter is required' },
        { status: 400 }
      );
    }

    // Query for invoice by DocNumber
    const queryString = `SELECT * FROM Invoice WHERE DocNumber = '${docNumber.replace(/'/g, "''")}'`;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:18',message:'Before query invoice by DocNumber',data:{docNumber,queryString},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    const invoices = await query<any>(queryString);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:24',message:'After query invoice by DocNumber',data:{invoicesFound:invoices.length,hasInvoice:invoices.length > 0,invoiceId:invoices[0]?.Id,invoiceKeys:invoices[0] ? Object.keys(invoices[0]) : [],fullInvoice:JSON.stringify(invoices[0] || {}),hasInvoiceLink:!!invoices[0]?.InvoiceLink,hasPaymentLink:!!invoices[0]?.PaymentLink,invoiceLink:invoices[0]?.InvoiceLink,paymentLink:invoices[0]?.PaymentLink},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: `Invoice with DocNumber "${docNumber}" not found` },
        { status: 404 }
      );
    }

    const invoice = invoices[0];

    // Now fetch full invoice details by ID with include parameter
    let invoiceWithLink;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:38',message:'Before getInvoice with include',data:{invoiceId:invoice.Id},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      
      invoiceWithLink = await getInvoice(invoice.Id, 'invoiceLink');
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:44',message:'After getInvoice with include',data:{hasInvoiceLink:!!invoiceWithLink.InvoiceLink,hasPaymentLink:!!invoiceWithLink.PaymentLink,invoiceLink:invoiceWithLink.InvoiceLink,paymentLink:invoiceWithLink.PaymentLink,fullResponse:JSON.stringify(invoiceWithLink)},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:50',message:'Error fetching invoice with include',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      invoiceWithLink = invoice;
    }

    return NextResponse.json({
      success: true,
      docNumber,
      invoiceId: invoice.Id,
      amount: invoice.TotalAmt,
      balance: invoice.Balance,
      invoiceLink: invoiceWithLink.InvoiceLink,
      paymentLink: invoiceWithLink.PaymentLink,
      fullInvoice: invoiceWithLink,
      // Return ALL fields from the invoice
      allFields: {
        ...invoiceWithLink,
        // Explicitly list all possible fields
        Id: invoiceWithLink.Id,
        SyncToken: invoiceWithLink.SyncToken,
        DocNumber: invoiceWithLink.DocNumber,
        CustomerRef: invoiceWithLink.CustomerRef,
        Line: invoiceWithLink.Line,
        CustomField: invoiceWithLink.CustomField,
        PrivateNote: invoiceWithLink.PrivateNote,
        InvoiceLink: invoiceWithLink.InvoiceLink,
        PaymentLink: invoiceWithLink.PaymentLink,
        AllowOnlinePayment: invoiceWithLink.AllowOnlinePayment,
        AllowOnlineCreditCardPayment: invoiceWithLink.AllowOnlineCreditCardPayment,
        AllowOnlineACHPayment: invoiceWithLink.AllowOnlineACHPayment,
        // Include any other fields that might be in the response
        rawResponse: JSON.stringify(invoiceWithLink, null, 2),
      },
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-invoice/route.ts:63',message:'Error in test-invoice API',data:{error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'test',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    console.error('Error in test-invoice API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

