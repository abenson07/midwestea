"use client";

import {
  TRANSACTION_LIST_STATUS_LABEL,
  getTransactionListStatus,
  type TransactionListStatus,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

export function TransactionStatusToken({ row }: { row: TransactionRow }) {
  const status = getTransactionListStatus(row);
  return <TransactionStatusPill status={status} />;
}

export function TransactionStatusPill({ status }: { status: TransactionListStatus }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: "transparent",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {TRANSACTION_LIST_STATUS_LABEL[status]}
    </span>
  );
}
