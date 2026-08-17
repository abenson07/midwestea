"use client";

import type { EventBudgetRow } from "@/data/mocks/events";

const TOKEN_COLOR: Record<EventBudgetRow["status"], string> = {
  Paid: "#27a644",
  Pending: "#f2c94c",
  Overdue: "#eb5757",
};

export type BudgetStatusTokenProps = {
  item: EventBudgetRow;
};

/** Budget line-item status cell — a colored token with the due date as a tooltip. */
export function BudgetStatusToken({ item }: BudgetStatusTokenProps) {
  const color = TOKEN_COLOR[item.status];

  return (
    <span
      title={`Due ${item.dueDate}`}
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
      {item.status}
    </span>
  );
}
