"use client";

import { Text } from "@/components/patterns/primitives/Text";
import type { EventBudgetSummary } from "@/data/mocks/events";

export type BudgetChartProps = {
  summary: EventBudgetSummary;
  onViewBudget?: () => void;
};

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const RECEIVED_COLOR = "#27a644";
const PENDING_COLOR = "#f2c94c";
const REMAINING_COLOR = "#8a8f98";

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          flexShrink: 0,
        }}
      />
      <Text size="sm" color="secondary">
        {label}
      </Text>
      <Text size="sm" weight="medium">
        {value}
      </Text>
    </span>
  );
}

/**
 * Budget summary — a left-to-right stacked bar showing received vs. pending
 * against the total event budget, with a legend underneath.
 */
export function BudgetChart({ summary, onViewBudget }: BudgetChartProps) {
  const { totalBudget, received, pending } = summary;
  const remaining = Math.max(totalBudget - received - pending, 0);

  const receivedPct = totalBudget > 0 ? (received / totalBudget) * 100 : 0;
  const pendingPct = totalBudget > 0 ? (pending / totalBudget) * 100 : 0;

  return (
    <section
      data-slot="budget-chart"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Text weight="semibold">Budget</Text>
          <Text size="sm" color="secondary">
            {formatCurrency(received + pending)} of {formatCurrency(totalBudget)} committed
          </Text>
        </div>
        {onViewBudget ? (
          <button
            type="button"
            onClick={onViewBudget}
            style={{
              all: "unset",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--linear-color-accent)",
            }}
          >
            View budget
          </button>
        ) : null}
      </div>

      <div
        role="img"
        aria-label={`${formatCurrency(received)} received, ${formatCurrency(pending)} pending, of a ${formatCurrency(totalBudget)} budget`}
        style={{
          display: "flex",
          width: "100%",
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--linear-color-sidebar-item-selected)",
        }}
      >
        <span style={{ width: `${receivedPct}%`, background: RECEIVED_COLOR }} />
        <span style={{ width: `${pendingPct}%`, background: PENDING_COLOR }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <LegendItem color={RECEIVED_COLOR} label="Received" value={formatCurrency(received)} />
        <LegendItem color={PENDING_COLOR} label="Pending" value={formatCurrency(pending)} />
        <LegendItem color={REMAINING_COLOR} label="Remaining" value={formatCurrency(remaining)} />
      </div>
    </section>
  );
}
