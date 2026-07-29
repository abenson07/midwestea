"use client";

import type { TransactionRow } from "@/data/mocks/transactions";
import {
  formatShortDate,
  getTransactionDisplayStatus,
  TRANSACTION_DISPLAY_STATUS_LABEL,
  type TransactionDisplayStatus,
} from "@/data/mocks/transaction-status";

const TOKEN_COLOR: Record<TransactionDisplayStatus, string> = {
  past_due: "#eb5757",
  due_soon: "#f2994a",
  pending: "#8a8f98",
  paid: "#27a644",
  cancelled: "#8a8f98",
  refunded: "#5e6ad2",
};

export type TransactionStatusTokenProps = {
  transaction: TransactionRow;
};

/** Colored status pill for a transaction row, mirrors InvoiceStatusToken's tooltip pattern. */
export function TransactionStatusToken({ transaction }: TransactionStatusTokenProps) {
  const status = getTransactionDisplayStatus(transaction);
  const color = TOKEN_COLOR[status];
  const title = transaction.dueDate
    ? status === "paid"
      ? `Paid on ${transaction.paymentDate ? formatShortDate(transaction.paymentDate) : "—"}`
      : `Due ${formatShortDate(transaction.dueDate)}`
    : undefined;

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {TRANSACTION_DISPLAY_STATUS_LABEL[status]}
    </span>
  );
}
