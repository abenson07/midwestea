"use client";

import type { ClassInvoiceRow } from "@/data/mocks/class-detail";

const TOKEN_COLOR: Record<"Paid" | "Overdue", string> = {
  Paid: "#27a644",
  Overdue: "#eb5757",
};

export type InvoiceStatusTokenProps = {
  invoice: ClassInvoiceRow;
};

/**
 * Invoice status cell — a colored token with a native-tooltip date for
 * Paid/Overdue, plain due-date text for Open.
 */
export function InvoiceStatusToken({ invoice }: InvoiceStatusTokenProps) {
  if (invoice.status === "Open") {
    return (
      <span style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
        Due {invoice.dueDate}
      </span>
    );
  }

  const color = TOKEN_COLOR[invoice.status];
  const label =
    invoice.status === "Paid" ? "Paid" : `${invoice.daysPastDue}d past due`;
  const title =
    invoice.status === "Paid"
      ? `Paid on ${invoice.paidDate}`
      : `Due ${invoice.dueDate}`;

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
      {label}
    </span>
  );
}
