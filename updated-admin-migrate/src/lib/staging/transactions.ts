import { createStagingAdminClient } from "./adminClient";

export type StagingTransaction = {
  id: string;
  enrollmentId: string | null;
  studentId: string | null;
  classId: string | null;
  transactionType: string | null;
  transactionStatus: string | null;
  dueDate: string | null;
  amountDue: number | null;
  invoiceNumber: number | string | null;
};

export async function listTransactions(): Promise<StagingTransaction[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, enrollment_id, student_id, class_id, transaction_type, transaction_status, due_date, amount_due, invoice_number",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    enrollmentId: (row.enrollment_id as string | null) ?? null,
    studentId: (row.student_id as string | null) ?? null,
    classId: (row.class_id as string | null) ?? null,
    transactionType: (row.transaction_type as string | null) ?? null,
    transactionStatus: (row.transaction_status as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
    amountDue: (row.amount_due as number | null) ?? null,
    invoiceNumber: (row.invoice_number as number | string | null) ?? null,
  }));
}
