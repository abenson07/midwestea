import { PaymentsDemo } from "@/components/patterns/client-templates-migrate/payments";
import { listClasses } from "@/lib/staging/classes";
import { listStudents } from "@/lib/staging/students";
import { listTransactions } from "@/lib/staging/transactions";
import { mapTransactionRows } from "./fromStaging";

export async function TransactionsMigrate() {
  const [transactions, students, classes] = await Promise.all([
    listTransactions(),
    listStudents(),
    listClasses(),
  ]);

  return <PaymentsDemo rows={mapTransactionRows(transactions, students, classes)} />;
}
