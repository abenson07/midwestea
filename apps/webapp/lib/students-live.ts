"use client";

import { createSupabaseClient, formatCurrency } from "@midwestea/utils";
import { getStudents, getStudentById, type StudentWithEmail } from "./students";
import { getClassesByStudentId, getCourses, getPrograms, type Class } from "./classes";
import { getTransactions, type TransactionWithDetails } from "./payments";
import type { StudentRow } from "@/data/mocks/students";
import type {
  StudentSummary,
  StudentClassRow,
  StudentInvoiceRow,
} from "@/data/mocks/student-detail";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function studentDisplayName(student: StudentWithEmail): string {
  return student.name || student.full_name || [student.first_name, student.last_name].filter(Boolean).join(" ") || "Unnamed Student";
}

/**
 * Roster for the Students list — real students, each with the class codes
 * they're enrolled in (via a single enrollments+classes join query).
 */
export async function getStudentsRoster(): Promise<{ students: StudentRow[] | null; error: string | null }> {
  const [{ students, error: studentsError }, { classCodes, error: classCodesError }] = await Promise.all([
    getStudents(),
    getStudentClassCodesMap(),
  ]);

  if (studentsError) return { students: null, error: studentsError };
  if (classCodesError) console.error("Error fetching student class codes:", classCodesError);

  const rows: StudentRow[] = (students ?? []).map((student) => ({
    id: student.id,
    name: studentDisplayName(student),
    email: student.email ?? "—",
    classes: classCodes?.[student.id] ?? [],
    studentSince: formatDate(student.created_at),
  }));

  return { students: rows, error: null };
}

async function getStudentClassCodesMap(): Promise<{
  classCodes: Record<string, string[]> | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("student_id, enrollment_status, classes (class_id)");

    if (error) return { classCodes: null, error: error.message };

    const map: Record<string, string[]> = {};
    for (const row of data ?? []) {
      if (row.enrollment_status === "removed") continue;
      const classRecord = row.classes as unknown as { class_id: string } | { class_id: string }[] | null;
      const code = Array.isArray(classRecord) ? classRecord[0]?.class_id : classRecord?.class_id;
      if (!code) continue;
      if (!map[row.student_id]) map[row.student_id] = [];
      map[row.student_id].push(code);
    }
    return { classCodes: map, error: null };
  } catch (err) {
    return { classCodes: null, error: err instanceof Error ? err.message : "Failed to load enrollments" };
  }
}

function classStatus(cls: Class): StudentClassRow["status"] {
  if (!cls.class_close_date) return "Enrolled";
  const closeDate = new Date(cls.class_close_date);
  if (!Number.isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) return "Completed";
  return "Enrolled";
}

function invoiceLabel(type: TransactionWithDetails["transaction_type"]): string {
  switch (type) {
    case "tuition_a":
      return "Invoice A";
    case "tuition_b":
      return "Invoice B";
    case "registration_fee":
      return "Registration Fee";
    case "pay_in_full":
      return "Pay in Full";
    default:
      return "Invoice";
  }
}

function toInvoiceRow(txn: TransactionWithDetails): StudentInvoiceRow {
  const amountCents = (txn.quantity ?? 1) * (txn.amount_due ?? 0);
  const dueDate = txn.due_date ? new Date(txn.due_date) : null;
  const isPaid = txn.transaction_status === "paid";
  const isPastDue = !isPaid && !!dueDate && !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now();

  const row: StudentInvoiceRow = {
    id: txn.id,
    className: txn.class_id_display ?? txn.class_id ?? "—",
    invoiceLabel: invoiceLabel(txn.transaction_type),
    amount: formatCurrency(amountCents),
    status: isPaid ? "Paid" : isPastDue ? "Overdue" : "Open",
    dueDate: formatDate(txn.due_date),
  };

  if (isPaid) {
    row.paidDate = formatDate(txn.payment_date);
  } else if (isPastDue && dueDate) {
    row.daysPastDue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return row;
}

export type StudentDetailData = {
  summary: StudentSummary;
  classes: StudentClassRow[];
  invoices: StudentInvoiceRow[];
};

/**
 * Real per-student detail data: core profile fields, enrolled classes (with
 * program name resolved from courses/programs), and transactions/invoices.
 */
export async function getStudentDetailData(studentId: string): Promise<{
  data: StudentDetailData | null;
  error: string | null;
}> {
  const [
    { student, error: studentError },
    { classes, error: classesError },
    { transactions, error: transactionsError },
    { courses },
    { programs },
  ] = await Promise.all([
    getStudentById(studentId),
    getClassesByStudentId(studentId),
    getTransactions(),
    getCourses(),
    getPrograms(),
  ]);

  if (studentError) return { data: null, error: studentError };
  if (!student) return { data: null, error: "Student not found" };
  if (classesError) console.error("Error fetching student classes:", classesError);
  if (transactionsError) console.error("Error fetching student transactions:", transactionsError);

  const courseNameByCode = new Map<string, string>();
  for (const course of [...(courses ?? []), ...(programs ?? [])]) {
    courseNameByCode.set(course.course_code, course.course_name);
  }

  const summary: StudentSummary = {
    name: studentDisplayName(student),
    email: student.email ?? "—",
    phone: student.phone ?? "—",
    status: "active",
    studentSince: formatDate(student.created_at),
    location: "—",
  };

  const studentClasses: StudentClassRow[] = (classes ?? []).map((cls) => ({
    id: cls.id,
    className: cls.class_id,
    program: courseNameByCode.get(cls.course_code) ?? cls.course_code,
    status: classStatus(cls),
    startDate: formatDate(cls.class_start_date),
    endDate: formatDate(cls.class_close_date),
  }));

  const invoices: StudentInvoiceRow[] = (transactions ?? [])
    .filter((txn) => txn.student_id === studentId)
    .map(toInvoiceRow);

  return { data: { summary, classes: studentClasses, invoices }, error: null };
}
