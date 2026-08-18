import type { TransactionRow, TransactionType } from "./transactions";

export type TransactionDisplayStatus =
  | "past_due"
  | "due_soon"
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded";

/** Live Transactions page statuses — no due-soon bucket. */
export type TransactionListStatus = "past_due" | "pending" | "paid" | "cancelled" | "refunded";

export type TransactionStatusFilter =
  | "all"
  | "open"
  | "past_due"
  | "paid"
  | "cancelled"
  | "refunded";

const DUE_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Mirrors `getInvoiceDisplayStatus` in `app/(platform)/admin/payments/page.tsx` —
 * derived live from `now`, not baked into the mock data. `due_soon` is extra for
 * overview cards; list filters use `getTransactionListStatus`.
 */
export function getTransactionDisplayStatus(
  row: TransactionRow,
  now: Date = new Date(),
): TransactionDisplayStatus {
  const list = getTransactionListStatus(row, now);
  if (list !== "pending") return list;
  if (!row.dueDate) return "pending";
  const due = new Date(row.dueDate);
  if (due.getTime() <= now.getTime() + DUE_SOON_WINDOW_MS) return "due_soon";
  return "pending";
}

export function getTransactionListStatus(
  row: TransactionRow,
  now: Date = new Date(),
): TransactionListStatus {
  if (row.transactionStatus === "paid") return "paid";
  if (row.transactionStatus === "cancelled") return "cancelled";
  if (row.transactionStatus === "refunded") return "refunded";
  if (row.dueDate && new Date(row.dueDate).getTime() < now.getTime()) return "past_due";
  return "pending";
}

export function matchesTransactionStatusFilter(
  row: TransactionRow,
  filter: TransactionStatusFilter | string,
): boolean {
  if (filter === "all") return true;
  const status = getTransactionListStatus(row);
  if (filter === "open") return status === "pending" || status === "past_due";
  return status === filter;
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  registration_fee: "Registration Fee",
  tuition_a: "First Invoice",
  tuition_b: "Second Invoice",
  custom: "Custom Invoice",
  pay_in_full: "Pay in Full",
};

export function getTransactionTypeLabel(type: TransactionType | null): string {
  if (!type) return "–";
  return TRANSACTION_TYPE_LABEL[type];
}

export const TRANSACTION_DISPLAY_STATUS_LABEL: Record<TransactionDisplayStatus, string> = {
  past_due: "Past due",
  due_soon: "Due soon",
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const TRANSACTION_LIST_STATUS_LABEL: Record<TransactionListStatus, string> = {
  past_due: "Past due",
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const TRANSACTION_STATUS_COLOR: Record<TransactionListStatus, string> = {
  paid: "#27a644",
  past_due: "#eb5757",
  pending: "#8a8f98",
  cancelled: "#8a8f98",
  refunded: "#2d9cdb",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCentsAsUSD(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTransactionAmountCents(row: TransactionRow): number {
  return Math.round(row.amountDueCents * row.quantity);
}

export function getTransactionDaysPastDue(row: TransactionRow, now: Date = new Date()): number {
  if (!row.dueDate) return 0;
  return Math.max(0, Math.floor((now.getTime() - new Date(row.dueDate).getTime()) / (24 * 60 * 60 * 1000)));
}

export type TransactionDiscountInfo = {
  percent: number;
  dollarOffCents: number;
  originalPayableCents: number;
  currentPayableCents: number;
  tooltip: string;
};

/** Percent + dollar off when original &gt; current. Null if never discounted. */
export function getTransactionDiscount(row: TransactionRow): TransactionDiscountInfo | null {
  if (row.originalAmountDueCents == null) return null;
  const originalPayableCents = Math.round(row.originalAmountDueCents * row.quantity);
  const currentPayableCents = getTransactionAmountCents(row);
  if (currentPayableCents >= originalPayableCents) return null;
  const dollarOffCents = originalPayableCents - currentPayableCents;
  const percent =
    row.discountPercent != null
      ? row.discountPercent
      : Math.round((dollarOffCents / originalPayableCents) * 100);
  return {
    percent,
    dollarOffCents,
    originalPayableCents,
    currentPayableCents,
    tooltip: `${percent}% off (${formatCentsAsUSD(dollarOffCents)}) from original ${formatCentsAsUSD(originalPayableCents)}`,
  };
}

/** End of the local calendar day for a `YYYY-MM-DD` value, as ISO. */
export function endOfLocalDayIso(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

export function dueDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today, as a `YYYY-MM-DD` value for a native date input. */
export function todayLocalDateInputValue(): string {
  return dueDateInputValue(new Date().toISOString());
}
