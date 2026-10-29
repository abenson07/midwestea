import { createStagingAdminClient } from "./adminClient";

/**
 * A transaction that /api/export-transactions-csv would include in its next
 * export (`transactions.downloaded = false`). Mirrors that route's filter so
 * the list on the Download invoices page matches the file the admin gets.
 */
export type PendingInvoiceRow = {
  id: string;
  invoiceNumber: string | null;
  studentName: string;
  studentEmail: string | null;
  classCode: string;
  amountCents: number;
  createdAt: string | null;
};

export async function listPendingInvoiceDownloads(): Promise<PendingInvoiceRow[]> {
  const supabase = createStagingAdminClient();

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("id, student_id, class_id, invoice_number, amount_due, created_at")
    .eq("downloaded", false)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  if (!transactions || transactions.length === 0) return [];

  const studentIds = [...new Set(transactions.map((t) => t.student_id).filter(Boolean))];
  const classIds = [...new Set(transactions.map((t) => t.class_id).filter(Boolean))];

  const [students, classes] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name, email").in("id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    classIds.length > 0
      ? supabase.from("classes").select("id, class_id").in("id", classIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (students.error) throw new Error(students.error.message);
  if (classes.error) throw new Error(classes.error.message);

  const studentsById = new Map(
    (students.data ?? []).map((s) => [
      s.id as string,
      s as { full_name: string | null; email: string | null },
    ]),
  );
  const classCodes = new Map(
    (classes.data ?? []).map((c) => [c.id as string, c.class_id as string | null]),
  );

  return transactions.map((t) => ({
    id: t.id as string,
    invoiceNumber: t.invoice_number == null ? null : String(t.invoice_number),
    studentName: studentsById.get(t.student_id as string)?.full_name || "—",
    studentEmail: studentsById.get(t.student_id as string)?.email ?? null,
    classCode: classCodes.get(t.class_id as string) || "—",
    amountCents: (t.amount_due as number | null) ?? 0,
    createdAt: (t.created_at as string | null) ?? null,
  }));
}
