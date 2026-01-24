import { NextRequest, NextResponse } from 'next/server';
import {
  renderCourseEnrollmentTemplate,
  getCourseEnrollmentSubject,
} from '@/lib/email-templates';

export const runtime = 'nodejs';

/**
 * GET /api/email-preview/course-enrollment
 * 
 * Preview course enrollment email template with sample data
 * 
 * Query parameters:
 * - studentName: Student name (default: "John Doe")
 * - courseName: Course name (default: "Introduction to Programming")
 * - courseCode: Course code (default: "CS101")
 * - amount: Amount in cents (default: 50000 = $500.00)
 * - invoiceNumber: Invoice number (default: 12345)
 * - paymentDate: Payment date ISO string (default: current date)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get parameters with defaults
    const studentName = searchParams.get('studentName') || 'John Doe';
    const courseName = searchParams.get('courseName') || 'Introduction to Programming';
    const courseCode = searchParams.get('courseCode') || 'CS101';
    const amount = parseInt(searchParams.get('amount') || '50000', 10);
    const invoiceNumber = parseInt(searchParams.get('invoiceNumber') || '12345', 10);
    const paymentDate = searchParams.get('paymentDate') || new Date().toISOString();

    // Render template with sample data
    const html = renderCourseEnrollmentTemplate({
      studentName,
      courseName,
      courseCode,
      amount,
      invoiceNumber,
      paymentDate,
    });

    const subject = getCourseEnrollmentSubject(courseName);

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





