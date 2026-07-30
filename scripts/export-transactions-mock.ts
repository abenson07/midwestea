/**
 * Pull a realistic sample of transactions (joined to students/classes/courses)
 * from the source Supabase project and print a TypeScript array literal
 * suitable for hand-pasting into apps/webapp/data/mocks/transactions.ts.
 *
 * This is a one-off, read-only seeding helper for the admin-preview
 * Transactions demo — it does not run at build time.
 *
 * Usage:
 *   npm run export:transactions-mock
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './lib/migration-env';

const LIMIT = 150;

function loadEnv() {
  const candidates = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../apps/webapp/.env.local'),
    path.resolve(__dirname, '../.env'),
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  }
}

function anonymize(firstName: string | null, lastName: string | null): string {
  const first = (firstName ?? 'Student').trim();
  const lastInitial = (lastName ?? '').trim().charAt(0);
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

function tsString(value: string | null | undefined): string {
  return value === null || value === undefined ? 'null' : JSON.stringify(value);
}

function tsNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? 'null' : String(value);
}

async function main() {
  loadEnv();
  const { url, serviceRoleKey } = getSupabaseCredentials('source');
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Fetching transactions...');
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(
      `id, enrollment_id, student_id, class_id, class_type, transaction_type, quantity,
       transaction_status, due_date, payment_date, created_at, invoice_number,
       amount_due, amount_paid, discount_percent, original_amount_due,
       students ( first_name, last_name ),
       classes ( class_id, class_name, course_code, class_start_date, class_close_date ),
       enrollments ( enrollment_status )`
    )
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (txError) throw new Error(`transactions: ${txError.message}`);

  const rows = transactions ?? [];

  const courseCodes = Array.from(
    new Set(
      rows
        .map((row: any) => row.classes?.course_code)
        .filter((code: unknown): code is string => typeof code === 'string')
    )
  );

  console.log(`Fetching ${courseCodes.length} courses...`);
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('course_code, course_name')
    .in('course_code', courseCodes.length > 0 ? courseCodes : ['__none__']);

  if (courseError) throw new Error(`courses: ${courseError.message}`);

  const courseByCode = new Map((courses ?? []).map((c: any) => [c.course_code, c.course_name]));

  const now = Date.now();
  const output = rows.map((row: any) => {
    const cls = row.classes;
    const classStart = cls?.class_start_date ? new Date(cls.class_start_date).getTime() : null;
    const classClose = cls?.class_close_date ? new Date(cls.class_close_date).getTime() : null;
    const isActiveClass =
      row.enrollments?.enrollment_status === 'registered' &&
      classStart !== null &&
      classStart <= now &&
      (classClose === null || classClose >= now);

    return {
      id: row.id,
      invoiceNumber: row.invoice_number ?? null,
      studentId: row.student_id,
      studentName: anonymize(row.students?.first_name, row.students?.last_name),
      studentEmail: null,
      classId: row.class_id,
      classCode: cls?.class_id ?? 'UNKNOWN',
      className: cls?.class_name ?? 'Unknown class',
      courseCode: cls?.course_code ?? 'UNKNOWN',
      courseName: courseByCode.get(cls?.course_code) ?? cls?.class_name ?? 'Unknown course',
      classType: row.class_type ?? 'course',
      transactionType: row.transaction_type,
      quantity: row.quantity ?? 1,
      amountDueCents: row.amount_due ?? 0,
      amountPaidCents: row.amount_paid ?? null,
      transactionStatus: row.transaction_status,
      dueDate: row.due_date ?? null,
      paymentDate: row.payment_date ?? null,
      createdAt: row.created_at,
      discountPercent: row.discount_percent ?? null,
      originalAmountDueCents: row.original_amount_due ?? null,
      isActiveClass: Boolean(isActiveClass),
    };
  });

  const lines = output.map((row) => {
    return `  {
    id: ${tsString(row.id)},
    invoiceNumber: ${tsString(row.invoiceNumber)},
    studentId: ${tsString(row.studentId)},
    studentName: ${tsString(row.studentName)},
    studentEmail: ${tsString(row.studentEmail)},
    classId: ${tsString(row.classId)},
    classCode: ${tsString(row.classCode)},
    className: ${tsString(row.className)},
    courseCode: ${tsString(row.courseCode)},
    courseName: ${tsString(row.courseName)},
    classType: ${tsString(row.classType)},
    transactionType: ${tsString(row.transactionType)},
    quantity: ${tsNumber(row.quantity)},
    amountDueCents: ${tsNumber(row.amountDueCents)},
    amountPaidCents: ${tsNumber(row.amountPaidCents)},
    transactionStatus: ${tsString(row.transactionStatus)},
    dueDate: ${tsString(row.dueDate)},
    paymentDate: ${tsString(row.paymentDate)},
    createdAt: ${tsString(row.createdAt)},
    discountPercent: ${tsNumber(row.discountPercent)},
    originalAmountDueCents: ${tsNumber(row.originalAmountDueCents)},
    isActiveClass: ${row.isActiveClass},
  },`;
  });

  console.log(`\nexport const sampleTransactions: TransactionRow[] = [\n${lines.join('\n')}\n];\n`);
  console.log(`// ${output.length} rows fetched`);
}

main().catch((error: unknown) => {
  console.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
