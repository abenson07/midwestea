import { createStagingAdminClient } from "./adminClient";
import { isUuid } from "./ids";

const TRANSACTION_SELECT =
  "id, enrollment_id, student_id, class_id, class_type, transaction_type, quantity, transaction_status, due_date, amount_due, amount_paid, invoice_number, payment_date, created_at";

export type StagingTransaction = {
  id: string;
  enrollmentId: string | null;
  studentId: string | null;
  classId: string | null;
  classType: "course" | "program" | null;
  transactionType: string | null;
  quantity: number | null;
  transactionStatus: string | null;
  dueDate: string | null;
  amountDue: number | null;
  amountPaid: number | null;
  invoiceNumber: number | string | null;
  paymentDate: string | null;
  createdAt: string | null;
  discountPercent: number | null;
  originalAmountDue: number | null;
};

export type ListTransactionsOptions = {
  studentId?: string;
  classId?: string;
};

function toStagingTransaction(row: Record<string, unknown>): StagingTransaction {
  const classType = row.class_type;
  return {
    id: row.id as string,
    enrollmentId: (row.enrollment_id as string | null) ?? null,
    studentId: (row.student_id as string | null) ?? null,
    classId: (row.class_id as string | null) ?? null,
    classType: classType === "course" || classType === "program" ? classType : null,
    transactionType: (row.transaction_type as string | null) ?? null,
    quantity: (row.quantity as number | null) ?? null,
    transactionStatus: (row.transaction_status as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
    amountDue: (row.amount_due as number | null) ?? null,
    amountPaid: (row.amount_paid as number | null) ?? null,
    invoiceNumber: (row.invoice_number as number | string | null) ?? null,
    paymentDate: (row.payment_date as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
    discountPercent: null,
    originalAmountDue: null,
  };
}

export async function listTransactions(
  options: ListTransactionsOptions = {},
): Promise<StagingTransaction[]> {
  const supabase = createStagingAdminClient();
  let query = supabase.from("transactions").select(TRANSACTION_SELECT).order("created_at", { ascending: false });

  if (options.studentId) {
    if (!isUuid(options.studentId)) return [];
    query = query.eq("student_id", options.studentId);
  }
  if (options.classId) {
    if (!isUuid(options.classId)) return [];
    query = query.eq("class_id", options.classId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => toStagingTransaction(row as Record<string, unknown>));
}
