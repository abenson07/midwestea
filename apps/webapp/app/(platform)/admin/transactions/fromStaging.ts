import type { StagingClass } from "@/lib/admin-migrate/classes";
import type { StagingStudent } from "@/lib/admin-migrate/students";
import type { StagingTransaction } from "@/lib/admin-migrate/transactions";
import type { TransactionRow, TransactionStatus, TransactionType } from "@/data/mocks/transactions";
import { todayIsoDate } from "@/lib/dates";

const TRANSACTION_TYPES = new Set<TransactionType>([
  "registration_fee",
  "tuition_a",
  "tuition_b",
  "custom",
  "pay_in_full",
]);

const TRANSACTION_STATUSES = new Set<TransactionStatus>(["pending", "paid", "cancelled", "refunded"]);

function isActiveClass(stagingClass: StagingClass | undefined): boolean {
  if (!stagingClass?.classEnd) return true;
  return stagingClass.classEnd >= todayIsoDate();
}

export function toTransactionRow(
  transaction: StagingTransaction,
  student: StagingStudent | undefined,
  stagingClass: StagingClass | undefined,
): TransactionRow {
  const type = transaction.transactionType;
  const status = transaction.transactionStatus;

  return {
    id: transaction.id,
    invoiceNumber: transaction.invoiceNumber == null ? null : String(transaction.invoiceNumber),
    studentId: transaction.studentId ?? "",
    studentName: student?.name ?? "Unknown Student",
    studentEmail: student?.email ?? null,
    classId: transaction.classId ?? "",
    classCode: stagingClass?.classCode ?? "—",
    className: stagingClass?.name ?? "—",
    courseCode: stagingClass?.courseCode ?? "—",
    courseName: stagingClass?.name ?? "—",
    classType: transaction.classType ?? "program",
    transactionType: type && TRANSACTION_TYPES.has(type as TransactionType) ? (type as TransactionType) : null,
    quantity: transaction.quantity ?? 1,
    amountDueCents: transaction.amountDue ?? 0,
    amountPaidCents: transaction.amountPaid,
    transactionStatus:
      status && TRANSACTION_STATUSES.has(status as TransactionStatus) ? (status as TransactionStatus) : "pending",
    dueDate: transaction.dueDate,
    paymentDate: transaction.paymentDate,
    createdAt: transaction.createdAt ?? "",
    discountPercent: transaction.discountPercent,
    originalAmountDueCents: transaction.originalAmountDue,
    isActiveClass: isActiveClass(stagingClass),
    stripeHostedInvoiceUrl: transaction.stripeHostedInvoiceUrl,
  };
}

export function mapTransactionRows(
  transactions: StagingTransaction[],
  students: StagingStudent[],
  classes: StagingClass[],
): TransactionRow[] {
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const classesById = new Map(classes.map((row) => [row.id, row]));
  return transactions.map((transaction) =>
    toTransactionRow(
      transaction,
      transaction.studentId ? studentsById.get(transaction.studentId) : undefined,
      transaction.classId ? classesById.get(transaction.classId) : undefined,
    ),
  );
}
