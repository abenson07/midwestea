import { PaymentsDemo } from "@/components/admin-migrate/patterns/payments";
import { listClasses } from "@/lib/admin-migrate/classes";
import { listStudents } from "@/lib/admin-migrate/students";
import { listTransactions } from "@/lib/admin-migrate/transactions";
import { mapTransactionRows } from "./fromStaging";

export async function TransactionsMigrate() {
  const [transactions, students, classes] = await Promise.all([
    listTransactions(),
    listStudents(),
    listClasses(),
  ]);

  return <PaymentsDemo rows={mapTransactionRows(transactions, students, classes)} />;
}
