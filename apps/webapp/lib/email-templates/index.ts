import fs from 'fs';
import path from 'path';
import {
  escapeHtml,
  formatCurrency,
  formatDate,
  renderTemplate,
} from '../email';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Data structure for course enrollment email template
 */
export interface CourseEnrollmentTemplateData {
  studentName: string;
  courseName: string;
  courseCode: string;
  amount: number; // Amount in cents
  invoiceNumber: number;
  paymentDate: string | Date;
}

/**
 * Outstanding invoice data for program enrollment emails
 */
export interface OutstandingInvoice {
  invoiceNumber: number;
  transactionType: 'tuition_a' | 'tuition_b';
  quantity: number;
  amountDue: number; // Amount in cents
  dueDate: string | Date;
}

/**
 * Data structure for program enrollment email template
 */
export interface ProgramEnrollmentTemplateData {
  studentName: string;
  programName: string;
  courseCode: string;
  startDate: string | Date;
  paidAmount: number; // Amount in cents
  invoiceNumber: number;
  paymentDate: string | Date;
  outstandingInvoices: OutstandingInvoice[];
}

// ============================================================================
// Template Loading
// ============================================================================

/**
 * Load HTML template file
 * 
 * @param templateName - Name of the template file (without .html extension)
 * @returns Template HTML string
 */
function loadTemplate(templateName: string): string {
  const templatePath = path.join(
    __dirname,
    `${templateName}.html`
  );
  
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to load email template "${templateName}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Cache loaded templates
const templateCache = new Map<string, string>();

/**
 * Get template with caching
 * 
 * @param templateName - Name of the template file
 * @returns Template HTML string
 */
function getTemplate(templateName: string): string {
  if (!templateCache.has(templateName)) {
    templateCache.set(templateName, loadTemplate(templateName));
  }
  return templateCache.get(templateName)!;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format transaction type to readable description
 * 
 * @param transactionType - Transaction type
 * @returns Human-readable description
 */
function formatTransactionType(
  transactionType: 'tuition_a' | 'tuition_b'
): string {
  switch (transactionType) {
    case 'tuition_a':
      return 'Tuition A (Due 3 weeks before start)';
    case 'tuition_b':
      return 'Tuition B (Due 1 week after start)';
    default:
      return transactionType;
  }
}

/**
 * Calculate total outstanding amount from invoices
 * 
 * @param invoices - Array of outstanding invoices
 * @returns Total amount in cents
 */
function calculateTotalOutstanding(invoices: OutstandingInvoice[]): number {
  return invoices.reduce((total, invoice) => {
    return total + invoice.quantity * invoice.amountDue;
  }, 0);
}

// ============================================================================
// Template Rendering Functions
// ============================================================================

/**
 * Render course enrollment email template
 * 
 * @param data - Course enrollment template data
 * @returns Rendered HTML email string
 * 
 * @example
 * ```typescript
 * const html = renderCourseEnrollmentTemplate({
 *   studentName: 'John Doe',
 *   courseName: 'Introduction to Programming',
 *   courseCode: 'CS101',
 *   amount: 50000, // $500.00
 *   invoiceNumber: 12345,
 *   paymentDate: new Date(),
 * });
 * ```
 */
export function renderCourseEnrollmentTemplate(
  data: CourseEnrollmentTemplateData
): string {
  // Load template
  let html = getTemplate('course-enrollment');

  // Prepare template variables with proper escaping
  const templateData: Record<string, string> = {
    studentName: escapeHtml(data.studentName || 'Student'),
    courseName: escapeHtml(data.courseName),
    courseCode: escapeHtml(data.courseCode),
    amount: formatCurrency(data.amount),
    invoiceNumber: String(data.invoiceNumber),
    paymentDate: formatDate(data.paymentDate, 'long'),
    currentYear: String(new Date().getFullYear()),
  };

  // Render template with variable substitution
  html = renderTemplate(html, templateData);

  // Templates already have full HTML structure (DOCTYPE, html, head, body)
  // so return as-is without additional wrapping
  return html;
}

/**
 * Render program enrollment email template
 * 
 * @param data - Program enrollment template data
 * @returns Rendered HTML email string
 * 
 * @example
 * ```typescript
 * const html = renderProgramEnrollmentTemplate({
 *   studentName: 'Jane Smith',
 *   programName: 'Full Stack Development Bootcamp',
 *   courseCode: 'FSD2024',
 *   startDate: '2024-03-01',
 *   paidAmount: 50000,
 *   invoiceNumber: 12345,
 *   paymentDate: new Date(),
 *   outstandingInvoices: [
 *     {
 *       invoiceNumber: 12346,
 *       transactionType: 'tuition_a',
 *       quantity: 0.5,
 *       amountDue: 100000,
 *       dueDate: '2024-02-08',
 *     },
 *   ],
 * });
 * ```
 */
export function renderProgramEnrollmentTemplate(
  data: ProgramEnrollmentTemplateData
): string {
  // Load template
  let html = getTemplate('program-enrollment');

  // Format outstanding invoices
  const hasOutstandingInvoices = data.outstandingInvoices.length > 0;
  const totalOutstanding = hasOutstandingInvoices
    ? calculateTotalOutstanding(data.outstandingInvoices)
    : 0;

  // Build outstanding invoices section HTML
  let outstandingInvoicesSection = '';
  if (hasOutstandingInvoices) {
    const invoicesRowsHtml = data.outstandingInvoices
      .map((invoice) => {
        const amount = invoice.quantity * invoice.amountDue;
        return `
          <tr>
            <td style="padding: 12px; color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0;">${invoice.invoiceNumber}</td>
            <td style="padding: 12px; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">${escapeHtml(formatTransactionType(invoice.transactionType))}</td>
            <td style="padding: 12px; text-align: right; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e0e0e0;">${formatCurrency(amount)}</td>
            <td style="padding: 12px; text-align: right; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">${formatDate(invoice.dueDate, 'date')}</td>
          </tr>
        `;
      })
      .join('');

    outstandingInvoicesSection = `
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="padding: 0;">
            <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">Outstanding Invoices</h2>
            <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; line-height: 1.5;">
              Please ensure all outstanding invoices are paid by their due dates to maintain your enrollment.
            </p>
            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 12px; text-align: left; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Invoice #</th>
                <th style="padding: 12px; text-align: left; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Description</th>
                <th style="padding: 12px; text-align: right; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Amount</th>
                <th style="padding: 12px; text-align: right; color: #333333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Due Date</th>
              </tr>
              ${invoicesRowsHtml}
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 12px; text-align: right; color: #333333; font-size: 14px; font-weight: 600;">Total Outstanding:</td>
                <td style="padding: 12px;"></td>
                <td style="padding: 12px; text-align: right; color: #333333; font-size: 16px; font-weight: 600;">${formatCurrency(totalOutstanding)}</td>
                <td style="padding: 12px;"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  // Prepare template variables (for text content that needs escaping)
  const templateData: Record<string, string> = {
    studentName: escapeHtml(data.studentName || 'Student'),
    programName: escapeHtml(data.programName),
    courseCode: escapeHtml(data.courseCode),
    startDate: formatDate(data.startDate, 'date'),
    paidAmount: formatCurrency(data.paidAmount),
    invoiceNumber: String(data.invoiceNumber),
    paymentDate: formatDate(data.paymentDate, 'long'),
    currentYear: String(new Date().getFullYear()),
  };

  // Render template with variable substitution (escapes text values)
  html = renderTemplate(html, templateData);
  
  // Insert outstanding invoices section directly (already HTML, don't escape)
  html = html.replace('{{outstandingInvoicesSection}}', outstandingInvoicesSection);

  // Templates already have full HTML structure (DOCTYPE, html, head, body)
  // so return as-is without additional wrapping
  return html;
}

// ============================================================================
// Subject Line Generators
// ============================================================================

/**
 * Generate subject line for course enrollment email
 * 
 * @param courseName - Name of the course
 * @returns Email subject line
 */
export function getCourseEnrollmentSubject(courseName: string): string {
  return `Welcome to ${courseName} - Enrollment Confirmed`;
}

/**
 * Generate subject line for program enrollment email
 * 
 * @param programName - Name of the program
 * @returns Email subject line
 */
export function getProgramEnrollmentSubject(programName: string): string {
  return `Welcome to ${programName} - Enrollment Confirmed`;
}

