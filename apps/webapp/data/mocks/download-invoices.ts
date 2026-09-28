import { sampleTransactions } from "./transactions";
import { getTransactionAmountCents } from "./transaction-status";

export type DownloadInvoiceRow = {
  id: string;
  invoiceNumber: string | null;
  studentName: string;
  studentEmail: string | null;
  classCode: string;
  amountCents: number;
  createdAt: string;
  downloaded: boolean;
};

const INITIAL: DownloadInvoiceRow[] = sampleTransactions
  .filter((row) => row.invoiceNumber != null)
  .map((row, index) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    classCode: row.classCode,
    amountCents: getTransactionAmountCents(row),
    createdAt: row.createdAt,
    downloaded: index > 5,
  }));

let rows: DownloadInvoiceRow[] = INITIAL.map((row) => ({ ...row }));

export function getDownloadInvoiceRows(): DownloadInvoiceRow[] {
  return rows;
}

export function markInvoicesDownloaded(ids: string[]): void {
  const set = new Set(ids);
  rows = rows.map((row) => (set.has(row.id) ? { ...row, downloaded: true } : row));
}
