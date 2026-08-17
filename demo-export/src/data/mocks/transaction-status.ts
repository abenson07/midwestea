import type { TransactionRow, TransactionType } from "./transactions";

export type TransactionDisplayStatus =
  | "past_due"
  | "due_soon"
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded";

const DUE_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Mirrors `getInvoiceDisplayStatus` in `app/(platform)/admin/payments/page.tsx` —
 * derived live from `now`, not baked into the mock data.
 */
export function getTransactionDisplayStatus(
  row: TransactionRow,
  now: Date = new Date(),
): TransactionDisplayStatus {
  if (row.transactionStatus === "paid") return "paid";
  if (row.transactionStatus === "cancelled") return "cancelled";
  if (row.transactionStatus === "refunded") return "refunded";
  if (!row.dueDate) return "pending";

  const due = new Date(row.dueDate);
  if (due.getTime() < now.getTime()) return "past_due";
  if (due.getTime() <= now.getTime() + DUE_SOON_WINDOW_MS) return "due_soon";
  return "pending";
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  registration_fee: "Registration",
  tuition_a: "Invoice 1",
  tuition_b: "Invoice 2",
  custom: "Custom Invoice",
  pay_in_full: "Pay in Full",
};

export const TRANSACTION_DISPLAY_STATUS_LABEL: Record<TransactionDisplayStatus, string> = {
  past_due: "Past Due",
  due_soon: "Due Soon",
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCentsAsUSD(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTransactionAmountCents(row: TransactionRow): number {
  return Math.round(row.amountDueCents * row.quantity);
}
