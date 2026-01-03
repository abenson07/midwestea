import { NextRequest, NextResponse } from 'next/server';
import {
  renderCourseEnrollmentTemplate,
  renderProgramEnrollmentTemplate,
  getCourseEnrollmentSubject,
  getProgramEnrollmentSubject,
} from '@/lib/email-templates';
import type {
  CourseEnrollmentTemplateData,
  ProgramEnrollmentTemplateData,
} from '@/lib/email-templates';

export const runtime = 'nodejs';

/**
 * Email Preview API Route
 * 
 * GET /api/email-preview?type=course|program
 * 
 * Preview email templates with sample data for development and testing
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'course';

  try {
    if (type === 'course') {
      // Sample course enrollment data
      const sampleData: CourseEnrollmentTemplateData = {
        studentName: 'John Doe',
        courseName: 'Introduction to Web Development',
        courseCode: 'WEB101',
        amount: 50000, // $500.00
        invoiceNumber: 12345,
        paymentDate: new Date(),
      };

      const html = renderCourseEnrollmentTemplate(sampleData);
      const subject = getCourseEnrollmentSubject(sampleData.courseName);

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else if (type === 'program') {
      // Sample program enrollment data
      const sampleData: ProgramEnrollmentTemplateData = {
        studentName: 'Jane Smith',
        programName: 'Full Stack Development Bootcamp',
        courseCode: 'FSD2024',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paidAmount: 50000, // $500.00
        invoiceNumber: 12345,
        paymentDate: new Date(),
        outstandingInvoices: [
          {
            invoiceNumber: 12346,
            transactionType: 'tuition_a',
            quantity: 0.5,
            amountDue: 100000, // $1,000.00
            dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
          },
          {
            invoiceNumber: 12347,
            transactionType: 'tuition_b',
            quantity: 0.5,
            amountDue: 100000, // $1,000.00
            dueDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
          },
        ],
      };

      const html = renderProgramEnrollmentTemplate(sampleData);
      const subject = getProgramEnrollmentSubject(sampleData.programName);

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "course" or "program"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[Email Preview] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-preview
 * 
 * Preview email templates with custom data
 * Body: { type: 'course' | 'program', data: CourseEnrollmentTemplateData | ProgramEnrollmentTemplateData }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || (type !== 'course' && type !== 'program')) {
      return NextResponse.json(
        { error: 'Invalid type. Use "course" or "program"' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Missing data field' },
        { status: 400 }
      );
    }

    let html: string;
    let subject: string;

    if (type === 'course') {
      html = renderCourseEnrollmentTemplate(data as CourseEnrollmentTemplateData);
      subject = getCourseEnrollmentSubject(data.courseName);
    } else {
      html = renderProgramEnrollmentTemplate(data as ProgramEnrollmentTemplateData);
      subject = getProgramEnrollmentSubject(data.programName);
    }

    return NextResponse.json({
      html,
      subject,
    });
  } catch (error: any) {
    console.error('[Email Preview] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

