"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
  getTransactionDiscount,
  type TransactionDiscountInfo,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

export type TransactionAmountCellProps = {
  row: TransactionRow;
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  height: 22,
  paddingInline: 8,
  borderRadius: 999,
  background: "var(--linear-color-sidebar-item-selected)",
  color: "var(--linear-color-ink-subtle)",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "16px",
  whiteSpace: "nowrap" as const,
  cursor: "help",
  flexShrink: 0,
};

function DiscountBadge({ discount }: { discount: TransactionDiscountInfo }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function show() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = 220;
      setPos({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      });
    }
    setOpen(true);
  }

  return (
    <>
      <span ref={ref} onMouseEnter={show} onMouseLeave={() => setOpen(false)} style={badgeStyle}>
        {discount.percent}% off
      </span>
      {open
        ? createPortal(
            <div
              role="tooltip"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 200,
                pointerEvents: "none",
                width: 220,
                padding: "8px 10px",
                borderRadius: 8,
                background: "var(--linear-color-canvas)",
                border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
                boxShadow: "var(--linear-shadow-canvas)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--linear-color-ink)" }}>
                Discount: {discount.percent}% off ({formatCentsAsUSD(discount.dollarOffCents)})
              </span>
              <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--linear-color-ink-subtle)" }}>
                Original: {formatCentsAsUSD(discount.originalPayableCents)}
              </span>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/** Payable amount plus a gray discount badge with a two-line hover tooltip. */
export function TransactionAmountCell({ row }: TransactionAmountCellProps) {
  const discount = getTransactionDiscount(row);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {formatCentsAsUSD(getTransactionAmountCents(row))}
      {discount ? <DiscountBadge discount={discount} /> : null}
    </span>
  );
}
