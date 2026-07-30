"use client";

import { getTransactions, type TransactionWithDetails } from "./payments";
import { getClasses, getCourses, getPrograms, type Class } from "./classes";
import type { TransactionRow, TransactionStatus, TransactionType } from "@/data/mocks/transactions";

const VALID_STATUSES: TransactionStatus[] = ["pending", "paid", "cancelled", "refunded"];
const VALID_TYPES: TransactionType[] = ["registration_fee", "tuition_a", "tuition_b", "custom", "pay_in_full"];

function isClosed(cls: Class): boolean {
  if (!cls.class_close_date) return false;
  const closeDate = new Date(cls.class_close_date);
  return !Number.isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now();
}

/**
 * Real transaction rows shaped like the admin-preview mock `TransactionRow`,
 * so every existing Transactions tab component can be reused unchanged —
 * just fed real data instead of `sampleTransactions`.
 */
export async function getTransactionRows(): Promise<{ rows: TransactionRow[] | null; error: string | null }> {
  const [
    { transactions, error: transactionsError },
    { classes },
    { courses },
    { programs },
  ] = await Promise.all([getTransactions(), getClasses(), getCourses(), getPrograms()]);

  if (transactionsError) return { rows: null, error: transactionsError };

  const classesById = new Map((classes ?? []).map((cls) => [cls.id, cls]));
  const courseNameByCode = new Map<string, string>();
  const classTypeByCode = new Map<string, "course" | "program">();
  for (const course of courses ?? []) {
    courseNameByCode.set(course.course_code, course.course_name);
    classTypeByCode.set(course.course_code, "course");
  }
  for (const program of programs ?? []) {
    courseNameByCode.set(program.course_code, program.course_name);
    classTypeByCode.set(program.course_code, "program");
  }

  const rows: TransactionRow[] = (transactions ?? []).map((txn) => toTransactionRow(txn, classesById, courseNameByCode, classTypeByCode));

  return { rows, error: null };
}

function toTransactionRow(
  txn: TransactionWithDetails,
  classesById: Map<string, Class>,
  courseNameByCode: Map<string, string>,
  classTypeByCode: Map<string, "course" | "program">,
): TransactionRow {
  const cls = txn.class_id ? classesById.get(txn.class_id) : undefined;
  const classCode = txn.class_id_display ?? cls?.class_id ?? "—";
  const courseCode = cls?.course_code ?? "—";
  const quantity = txn.quantity ?? 1;
  const amountDueCents = txn.amount_due ?? 0;
  const status: TransactionStatus = VALID_STATUSES.includes(txn.transaction_status as TransactionStatus)
    ? (txn.transaction_status as TransactionStatus)
    : "pending";
  const transactionType: TransactionType = VALID_TYPES.includes(txn.transaction_type as TransactionType)
    ? (txn.transaction_type as TransactionType)
    : "custom";

  return {
    id: txn.id,
    invoiceNumber: txn.invoice_number,
    studentId: txn.student_id ?? "",
    studentName: txn.student_name ?? "Unknown Student",
    studentEmail: txn.student_email ?? null,
    classId: txn.class_id ?? cls?.id ?? "",
    classCode,
    className: cls?.class_name ?? classCode,
    courseCode,
    courseName: courseNameByCode.get(courseCode) ?? courseCode,
    classType: classTypeByCode.get(courseCode) ?? (cls?.is_online ? "course" : "program"),
    transactionType,
    quantity,
    amountDueCents,
    amountPaidCents: status === "paid" ? quantity * amountDueCents : null,
    transactionStatus: status,
    dueDate: txn.due_date,
    paymentDate: txn.payment_date ?? null,
    createdAt: txn.created_at ?? new Date().toISOString(),
    discountPercent: txn.discount_percent ?? null,
    originalAmountDueCents: txn.original_amount_due ?? null,
    isActiveClass: cls ? !cls.is_online && !isClosed(cls) : false,
  };
}
