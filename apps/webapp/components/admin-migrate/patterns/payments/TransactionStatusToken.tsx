"use client";

import {
  TRANSACTION_LIST_STATUS_LABEL,
  TRANSACTION_STATUS_COLOR,
  getTransactionListStatus,
  type TransactionListStatus,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

export function TransactionStatusToken({ row }: { row: TransactionRow }) {
  const status = getTransactionListStatus(row);
  return <TransactionStatusPill status={status} />;
}

export function TransactionStatusPill({ status }: { status: TransactionListStatus }) {
  const color = TRANSACTION_STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
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
      {TRANSACTION_LIST_STATUS_LABEL[status]}
    </span>
  );
}
