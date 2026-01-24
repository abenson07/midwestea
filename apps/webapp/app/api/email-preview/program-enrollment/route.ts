import { NextRequest, NextResponse } from 'next/server';
import {
  renderProgramEnrollmentTemplate,
  getProgramEnrollmentSubject,
  type OutstandingInvoice,
} from '@/lib/email-templates';

export const runtime = 'nodejs';

/**
 * GET /api/email-preview/program-enrollment
 * 
 * Preview program enrollment email template with sample data
 * 
 * Query parameters:
 * - studentName: Student name (default: "Jane Smith")
 * - programName: Program name (default: "Full Stack Development Bootcamp")
 * - courseCode: Course code (default: "FSD2024")
 * - startDate: Class start date ISO string (default: current date + 30 days)
 * - paidAmount: Amount paid in cents (default: 50000 = $500.00)
 * - invoiceNumber: Invoice number (default: 12345)
 * - paymentDate: Payment date ISO string (default: current date)
 * - outstandingInvoices: JSON array of outstanding invoices (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get parameters with defaults
    const studentName = searchParams.get('studentName') || 'Jane Smith';
    const programName = searchParams.get('programName') || 'Full Stack Development Bootcamp';
    const courseCode = searchParams.get('courseCode') || 'FSD2024';
    const startDate = searchParams.get('startDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const paidAmount = parseInt(searchParams.get('paidAmount') || '50000', 10);
    const invoiceNumber = parseInt(searchParams.get('invoiceNumber') || '12345', 10);
    const paymentDate = searchParams.get('paymentDate') || new Date().toISOString();

    // Parse outstanding invoices if provided
    let outstandingInvoices: OutstandingInvoice[] = [];
    const invoicesParam = searchParams.get('outstandingInvoices');
    if (invoicesParam) {
      try {
        outstandingInvoices = JSON.parse(invoicesParam);
      } catch (error) {
        console.warn('[email-preview] Failed to parse outstandingInvoices:', error);
      }
    } else {
      // Default sample outstanding invoices
      outstandingInvoices = [
        {
          invoiceNumber: 12346,
          transactionType: 'tuition_a',
          quantity: 0.5,
          amountDue: 100000, // $1,000.00
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          invoiceNumber: 12347,
          transactionType: 'tuition_b',
          quantity: 0.5,
          amountDue: 100000, // $1,000.00
          dueDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    // Render template with sample data
    const html = renderProgramEnrollmentTemplate({
      studentName,
      programName,
      courseCode,
      startDate,
      paidAmount,
      invoiceNumber,
      paymentDate,
      outstandingInvoices,
    });

    const subject = getProgramEnrollmentSubject(programName);

    // Return HTML preview
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Email-Subject': subject,
      },
    });
  } catch (error: any) {
    console.error('[email-preview] Error rendering template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to render email preview',
      },
      { status: 500 }
    );
  }
}





