"use client";

import { Card } from "@/components/patterns/primitives/Card";

export type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card padding={4}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
        <span style={{ fontSize: 24, fontWeight: 600, color: "var(--linear-color-ink)" }}>
          {value}
        </span>
      </div>
    </Card>
  );
}
