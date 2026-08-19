import { sampleTransactions } from "./transactions";
import { getTransactionAmountCents } from "./transaction-status";

export type PayoutInvoiceRow = {
  id: string;
  payoutId: string;
  payoutDate: string;
  studentEmail: string;
  amountCents: number;
  paymentDate: string | null;
  invoiceNumber: string | null;
  reconciled: boolean;
};

const PAYOUT_A = { id: "po_3Nq8kL2eZvKYlo2C", date: "2026-08-15T00:00:00.000Z" };
const PAYOUT_B = { id: "po_4Rt1mP9eZvKYlo2C", date: "2026-08-08T00:00:00.000Z" };

const INITIAL: PayoutInvoiceRow[] = sampleTransactions
  .filter((row) => row.transactionStatus === "paid")
  .slice(0, 6)
  .map((row, index) => {
    const payout = index < 4 ? PAYOUT_A : PAYOUT_B;
    return {
      id: row.id,
      payoutId: payout.id,
      payoutDate: payout.date,
      studentEmail: row.studentEmail ?? "N/A",
      amountCents: getTransactionAmountCents(row),
      paymentDate: row.paymentDate,
      invoiceNumber: row.invoiceNumber,
      reconciled: index === 0 || index === 5,
    };
  });

let rows: PayoutInvoiceRow[] = INITIAL.map((row) => ({ ...row }));

export function getPayoutInvoiceRows(): PayoutInvoiceRow[] {
  return rows;
}

export function setPayoutReconciled(id: string, reconciled: boolean): void {
  rows = rows.map((row) => (row.id === id ? { ...row, reconciled } : row));
}
