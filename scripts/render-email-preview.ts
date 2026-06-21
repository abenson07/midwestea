/**
 * Render Email Preview for Testing
 * 
 * Renders email templates and saves to HTML files for manual inspection
 * 
 * Usage:
 *   npm run render-email-preview
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  renderCourseEnrollmentTemplate,
  renderProgramEnrollmentTemplate,
  renderWaitlistConfirmationTemplate,
  renderTuitionReminderTemplate,
} from '../apps/webapp/lib/email-templates';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const outputDir = path.resolve(__dirname, '../email-previews');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📧 Rendering email templates...\n');

try {
  // Render course enrollment template
  const courseData = {
    studentName: 'John Doe',
    courseName: 'Introduction to Web Development',
    courseCode: 'WEB101',
    amount: 50000,
    invoiceNumber: 12345,
    paymentDate: new Date('2024-01-15'),
  };

  const courseHtml = renderCourseEnrollmentTemplate(courseData);
  const coursePath = path.join(outputDir, 'course-enrollment-preview.html');
  fs.writeFileSync(coursePath, courseHtml, 'utf-8');
  console.log(`✅ Course enrollment template rendered: ${coursePath}`);

  // Render program enrollment template
  const programData = {
    studentName: 'Jane Smith',
    programName: 'Full Stack Development Bootcamp',
    courseCode: 'FSD2024',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paidAmount: 50000,
    invoiceNumber: 12345,
    paymentDate: new Date('2024-01-15'),
    outstandingInvoices: [
      {
        invoiceNumber: 12346,
        transactionType: 'tuition_a' as const,
        quantity: 0.5,
        amountDue: 100000,
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceNumber: 12347,
        transactionType: 'tuition_b' as const,
        quantity: 0.5,
        amountDue: 100000,
        dueDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      },
    ],
  };

  const programHtml = renderProgramEnrollmentTemplate(programData);
  const programPath = path.join(outputDir, 'program-enrollment-preview.html');
  fs.writeFileSync(programPath, programHtml, 'utf-8');
  console.log(`✅ Program enrollment template rendered: ${programPath}`);

  const waitlistData = {
    studentName: 'Jane Smith',
    courseName: 'Advanced Emergency Medical Technician',
    courseCode: 'AEMT',
  };
  const waitlistHtml = renderWaitlistConfirmationTemplate(waitlistData);
  const waitlistPath = path.join(outputDir, 'waitlist-confirmation-preview.html');
  fs.writeFileSync(waitlistPath, waitlistHtml, 'utf-8');
  console.log(`✅ Waitlist confirmation template rendered: ${waitlistPath}`);

  const tuitionData = {
    studentName: 'Jane Smith',
    programName: 'Emergency Medical Technician',
    invoiceDescription: 'Tuition A (Due 3 weeks before start)',
    amountDue: 107500,
    invoiceNumber: 12346,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  };
  const tuitionHtml = renderTuitionReminderTemplate(tuitionData);
  const tuitionPath = path.join(outputDir, 'tuition-reminder-preview.html');
  fs.writeFileSync(tuitionPath, tuitionHtml, 'utf-8');
  console.log(`✅ Tuition reminder template rendered: ${tuitionPath}`);

  const adminOtpSource = path.resolve(
    __dirname,
    '../apps/webapp/lib/email-templates/admin-otp.html'
  );
  const adminOtpPath = path.join(outputDir, 'admin-otp-supabase.html');
  fs.copyFileSync(adminOtpSource, adminOtpPath);
  console.log(`✅ Admin OTP template copied (Supabase paste-in): ${adminOtpPath}`);

  // Validate HTML structure
  console.log('\n🔍 Validating HTML structure...');
  
  const validateHtml = (html: string, name: string) => {
    const issues: string[] = [];
    
    // Check for DOCTYPE
    if (!html.includes('<!DOCTYPE')) {
      issues.push('Missing DOCTYPE declaration');
    }
    
    // Check for proper HTML structure
    if (!html.includes('<html')) {
      issues.push('Missing <html> tag');
    }
    
    if (!html.includes('</html>')) {
      issues.push('Missing closing </html> tag');
    }
    
    if (!html.includes('<head>')) {
      issues.push('Missing <head> tag');
    }
    
    if (!html.includes('</head>')) {
      issues.push('Missing closing </head> tag');
    }
    
    if (!html.includes('<body')) {
      issues.push('Missing <body> tag');
    }
    
    if (!html.includes('</body>')) {
      issues.push('Missing closing </body> tag');
    }
    
    // Check for unclosed script tags (common issue)
    const scriptOpenMatches = html.match(/<script[^>]*>/gi) || [];
    const scriptCloseMatches = html.match(/<\/script>/gi) || [];
    if (scriptOpenMatches.length !== scriptCloseMatches.length) {
      issues.push(`Unclosed script tags: ${scriptOpenMatches.length} open, ${scriptCloseMatches.length} close`);
    }
    
    // Check for template variables that weren't replaced
    const unreplacedVars = html.match(/{{[^}]+}}/g);
    if (unreplacedVars && unreplacedVars.length > 0) {
      issues.push(`Unreplaced template variables: ${unreplacedVars.join(', ')}`);
    }
    
    if (issues.length > 0) {
      console.log(`\n⚠️  ${name} issues:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      return false;
    } else {
      console.log(`✅ ${name}: HTML structure is valid`);
      return true;
    }
  };

  validateHtml(courseHtml, 'Course enrollment');
  validateHtml(programHtml, 'Program enrollment');
  validateHtml(waitlistHtml, 'Waitlist confirmation');
  validateHtml(tuitionHtml, 'Tuition reminder');

  console.log('\n✨ Email templates rendered successfully!');
  console.log(`\n📁 Preview files saved to: ${outputDir}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Open the HTML files in your browser');
  console.log('   2. Copy/paste into email testing tools (Litmus, Email on Acid)');
  console.log('   3. Test in actual email clients');
  
} catch (error: any) {
  console.error('❌ Error rendering templates:', error.message);
  console.error(error.stack);
  process.exit(1);
}





