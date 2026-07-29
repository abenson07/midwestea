"use client";

import type { TransactionType } from "@/data/mocks/transactions";
import { TRANSACTION_TYPE_LABEL } from "@/data/mocks/transaction-status";

const BADGE_COLOR: Record<TransactionType, string> = {
  registration_fee: "#8a8f98",
  tuition_a: "#5e6ad2",
  tuition_b: "#5e6ad2",
  custom: "#8a8f98",
  pay_in_full: "#27a644",
};

export type TransactionTypeBadgeProps = {
  transactionType: TransactionType;
};

/** Small pill for "Registration" / "Invoice 1" / "Invoice 2" etc. */
export function TransactionTypeBadge({ transactionType }: TransactionTypeBadgeProps) {
  const color = BADGE_COLOR[transactionType];
  return (
    <span
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
      {TRANSACTION_TYPE_LABEL[transactionType]}
    </span>
  );
}
