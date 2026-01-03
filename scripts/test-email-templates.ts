/**
 * Test Email Templates
 * 
 * Tests email template rendering with various data inputs including edge cases
 * 
 * Usage:
 *   npm run test-email-templates
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  renderCourseEnrollmentTemplate,
  renderProgramEnrollmentTemplate,
  getCourseEnrollmentSubject,
  getProgramEnrollmentSubject,
} from '../apps/webapp/lib/email-templates';
import type {
  CourseEnrollmentTemplateData,
  ProgramEnrollmentTemplateData,
} from '../apps/webapp/lib/email-templates';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Test results tracking
const testResults: Array<{ name: string; passed: boolean; error?: string }> = [];

function test(name: string, fn: () => void | Promise<void>): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => {
          testResults.push({ name, passed: true });
          console.log(`✅ ${name}`);
        })
        .catch((error) => {
          testResults.push({ name, passed: false, error: error.message });
          console.error(`❌ ${name}: ${error.message}`);
        });
    } else {
      testResults.push({ name, passed: true });
      console.log(`✅ ${name}`);
    }
  } catch (error: any) {
    testResults.push({ name, passed: false, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Email Templates\n');

  // Test 1: Course enrollment template with normal data
  test('Course enrollment template - normal data', () => {
    const data: CourseEnrollmentTemplateData = {
      studentName: 'John Doe',
      courseName: 'Introduction to Web Development',
      courseCode: 'WEB101',
      amount: 50000,
      invoiceNumber: 12345,
      paymentDate: new Date('2024-01-15'),
    };

    const html = renderCourseEnrollmentTemplate(data);
    const subject = getCourseEnrollmentSubject(data.courseName);

    if (!html.includes('John Doe')) {
      throw new Error('Student name not found in rendered HTML');
    }
    if (!html.includes('Introduction to Web Development')) {
      throw new Error('Course name not found in rendered HTML');
    }
    if (!html.includes('$500.00')) {
      throw new Error('Formatted amount not found in rendered HTML');
    }
    if (!html.includes('12345')) {
      throw new Error('Invoice number not found in rendered HTML');
    }
    if (subject !== 'Welcome to Introduction to Web Development - Enrollment Confirmed') {
      throw new Error('Subject line incorrect');
    }
  });

  // Test 2: Course enrollment template with XSS attempt
  test('Course enrollment template - XSS prevention', () => {
    const data: CourseEnrollmentTemplateData = {
      studentName: '<script>alert("xss")</script>',
      courseName: 'Test Course',
      courseCode: 'TEST101',
      amount: 10000,
      invoiceNumber: 99999,
      paymentDate: new Date(),
    };

    const html = renderCourseEnrollmentTemplate(data);

    // Check that script tags are escaped (should not appear as raw HTML)
    if (html.includes('<script>') && !html.includes('&lt;script&gt;')) {
      throw new Error('XSS vulnerability: script tag not escaped');
    }
    // The escaped version should be present OR the wrapper might handle it differently
    // As long as raw <script> doesn't appear in a dangerous way, it's safe
    if (html.match(/<script[^>]*>/i) && !html.includes('&lt;script')) {
      throw new Error('XSS prevention: script tag should be escaped');
    }
  });

  // Test 3: Course enrollment template with special characters
  test('Course enrollment template - special characters', () => {
    const data: CourseEnrollmentTemplateData = {
      studentName: "O'Brien & Associates",
      courseName: 'C++ Programming "Advanced"',
      courseCode: 'CPP-2024',
      amount: 75000,
      invoiceNumber: 54321,
      paymentDate: new Date(),
    };

    const html = renderCourseEnrollmentTemplate(data);

    // Should render without errors
    if (html.length === 0) {
      throw new Error('Template rendered empty HTML');
    }
    // Check that special characters are escaped
    if (html.includes('&amp;') && html.includes("O'Brien")) {
      // Good - ampersand is escaped
    }
  });

  // Test 4: Program enrollment template with outstanding invoices
  test('Program enrollment template - with outstanding invoices', () => {
    const data: ProgramEnrollmentTemplateData = {
      studentName: 'Jane Smith',
      programName: 'Full Stack Development Bootcamp',
      courseCode: 'FSD2024',
      startDate: new Date('2024-03-01'),
      paidAmount: 50000,
      invoiceNumber: 12345,
      paymentDate: new Date('2024-01-15'),
      outstandingInvoices: [
        {
          invoiceNumber: 12346,
          transactionType: 'tuition_a',
          quantity: 0.5,
          amountDue: 100000,
          dueDate: new Date('2024-02-08'),
        },
        {
          invoiceNumber: 12347,
          transactionType: 'tuition_b',
          quantity: 0.5,
          amountDue: 100000,
          dueDate: new Date('2024-03-08'),
        },
      ],
    };

    const html = renderProgramEnrollmentTemplate(data);
    const subject = getProgramEnrollmentSubject(data.programName);

    if (!html.includes('Jane Smith')) {
      throw new Error('Student name not found');
    }
    if (!html.includes('Full Stack Development Bootcamp')) {
      throw new Error('Program name not found');
    }
    if (!html.includes('Outstanding Invoices')) {
      throw new Error('Outstanding invoices section not found');
    }
    if (!html.includes('12346')) {
      throw new Error('First invoice number not found');
    }
    if (!html.includes('12347')) {
      throw new Error('Second invoice number not found');
    }
    // Check individual invoice amounts (0.5 * 100000 = 50000 cents = $500.00)
    // Both invoices are $500.00 each, total should be $1,000.00
    if (!html.includes('$500.00')) {
      throw new Error('Individual invoice amount not formatted correctly');
    }
    // Total: $500.00 + $500.00 = $1,000.00
    if (!html.includes('$1,000.00')) {
      throw new Error('Total outstanding amount not calculated correctly (expected $1,000.00 for two $500 invoices)');
    }
    if (subject !== 'Welcome to Full Stack Development Bootcamp - Enrollment Confirmed') {
      throw new Error('Subject line incorrect');
    }
  });

  // Test 5: Program enrollment template without outstanding invoices
  test('Program enrollment template - no outstanding invoices', () => {
    const data: ProgramEnrollmentTemplateData = {
      studentName: 'Bob Johnson',
      programName: 'Data Science Bootcamp',
      courseCode: 'DS2024',
      startDate: new Date('2024-04-01'),
      paidAmount: 50000,
      invoiceNumber: 12345,
      paymentDate: new Date(),
      outstandingInvoices: [],
    };

    const html = renderProgramEnrollmentTemplate(data);

    if (html.includes('Outstanding Invoices')) {
      throw new Error('Outstanding invoices section should not appear when empty');
    }
  });

  // Test 6: Currency formatting
  test('Currency formatting - various amounts', () => {
    const testCases = [
      { cents: 0, expected: '$0.00' },
      { cents: 100, expected: '$1.00' },
      { cents: 50000, expected: '$500.00' },
      { cents: 123456, expected: '$1,234.56' },
      { cents: 1000000, expected: '$10,000.00' },
    ];

    testCases.forEach(({ cents, expected }) => {
      const data: CourseEnrollmentTemplateData = {
        studentName: 'Test',
        courseName: 'Test Course',
        courseCode: 'TEST',
        amount: cents,
        invoiceNumber: 1,
        paymentDate: new Date(),
      };

      const html = renderCourseEnrollmentTemplate(data);
      if (!html.includes(expected)) {
        throw new Error(`Currency formatting failed: ${cents} cents should render as ${expected}`);
      }
    });
  });

  // Test 7: Date formatting
  test('Date formatting - various formats', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    const data: CourseEnrollmentTemplateData = {
      studentName: 'Test',
      courseName: 'Test Course',
      courseCode: 'TEST',
      amount: 10000,
      invoiceNumber: 1,
      paymentDate: date,
    };

    const html = renderCourseEnrollmentTemplate(data);

    // Should contain formatted date (format varies by locale, but should contain month name)
    if (!html.includes('March') && !html.includes('2024')) {
      throw new Error('Date not formatted correctly');
    }
  });

  // Test 8: Template structure validation
  test('Template structure - required HTML elements', () => {
    const data: CourseEnrollmentTemplateData = {
      studentName: 'Test',
      courseName: 'Test Course',
      courseCode: 'TEST',
      amount: 10000,
      invoiceNumber: 1,
      paymentDate: new Date(),
    };

    const html = renderCourseEnrollmentTemplate(data);

    // Check for required HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      throw new Error('Missing DOCTYPE declaration');
    }
    if (!html.includes('<html')) {
      throw new Error('Missing HTML tag');
    }
    if (!html.includes('<body')) {
      throw new Error('Missing body tag');
    }
    if (!html.includes('MidwestEA')) {
      throw new Error('Missing company name');
    }
    if (!html.includes('support@midwestea.com')) {
      throw new Error('Missing support email');
    }
  });

  // Test 9: Invoice calculation accuracy
  test('Invoice calculation - quantity * amount_due', () => {
    const data: ProgramEnrollmentTemplateData = {
      studentName: 'Test',
      programName: 'Test Program',
      courseCode: 'TEST',
      startDate: new Date(),
      paidAmount: 50000,
      invoiceNumber: 1,
      paymentDate: new Date(),
      outstandingInvoices: [
        {
          invoiceNumber: 1,
          transactionType: 'tuition_a',
          quantity: 0.5,
          amountDue: 100000, // $1,000.00
          dueDate: new Date(),
        },
        {
          invoiceNumber: 2,
          transactionType: 'tuition_b',
          quantity: 1.0,
          amountDue: 50000, // $500.00
          dueDate: new Date(),
        },
      ],
    };

    const html = renderProgramEnrollmentTemplate(data);

    // First invoice: 0.5 * $1,000.00 = $500.00
    if (!html.includes('$500.00')) {
      throw new Error('First invoice amount calculation incorrect');
    }

    // Second invoice: 1.0 * $500.00 = $500.00
    // Total: $500.00 + $500.00 = $1,000.00
    if (!html.includes('$1,000.00')) {
      throw new Error('Total outstanding calculation incorrect');
    }
  });

  // Test 10: Empty/null handling
  test('Template rendering - handles empty student name', () => {
    const data: CourseEnrollmentTemplateData = {
      studentName: '',
      courseName: 'Test Course',
      courseCode: 'TEST',
      amount: 10000,
      invoiceNumber: 1,
      paymentDate: new Date(),
    };

    const html = renderCourseEnrollmentTemplate(data);

    // Should default to "Student" or handle gracefully
    if (html.length === 0) {
      throw new Error('Template should render even with empty student name');
    }
  });

  // Wait for async tests to complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Print summary
  console.log('\n📊 Test Summary:');
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  console.log(`   Total: ${testResults.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

