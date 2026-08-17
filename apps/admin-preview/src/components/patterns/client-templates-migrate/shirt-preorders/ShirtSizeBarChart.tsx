"use client";

import { Text } from "@/components/patterns/primitives/Text";

export type ShirtSizeBarChartProps = {
  sizeCounts: { size: string; count: number }[];
};

const SIZE_COLORS = ["#5e6ad2", "#27a644", "#f2994a", "#eb5757", "#f2c94c", "#8a8f98"];

function colorForIndex(index: number): string {
  return SIZE_COLORS[index % SIZE_COLORS.length]!;
}

/**
 * Per-size order counts as a horizontal bar-per-size chart — hand-rolled
 * (no chart lib in the project), matching `BudgetChart`'s panel styling.
 */
export function ShirtSizeBarChart({ sizeCounts }: ShirtSizeBarChartProps) {
  const total = sizeCounts.reduce((sum, row) => sum + row.count, 0);
  const maxCount = Math.max(1, ...sizeCounts.map((row) => row.count));

  return (
    <section
      data-slot="shirt-size-bar-chart"
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
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text weight="semibold">Orders by size</Text>
        <Text size="sm" color="secondary">
          {total} total shirt{total === 1 ? "" : "s"} ordered
        </Text>
      </div>

      {sizeCounts.length === 0 ? (
        <Text size="sm" color="secondary">
          No orders yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sizeCounts.map((row, index) => {
            const pct = (row.count / maxCount) * 100;
            return (
              <div key={row.size} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Text
                  size="sm"
                  color="secondary"
                  style={{ width: 44, flexShrink: 0, textAlign: "right" }}
                >
                  {row.size}
                </Text>
                <div
                  role="img"
                  aria-label={`${row.count} orders for size ${row.size}`}
                  style={{
                    flex: 1,
                    height: 10,
                    borderRadius: 999,
                    overflow: "hidden",
                    background: "var(--linear-color-sidebar-item-selected)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: `${pct}%`,
                      height: "100%",
                      background: colorForIndex(index),
                    }}
                  />
                </div>
                <Text size="sm" weight="medium" style={{ width: 24, flexShrink: 0, textAlign: "right" }}>
                  {row.count}
                </Text>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
