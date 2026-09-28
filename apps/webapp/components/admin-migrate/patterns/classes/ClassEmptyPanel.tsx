"use client";

import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type ClassEmptyPanelProps = {
  title: string;
  emptyLabel: string;
};

/** Empty-state card for Prerequisites/Invoices — mirrors `SponsorshipLevelsPanel`'s chrome. */
export function ClassEmptyPanel({ title, emptyLabel }: ClassEmptyPanelProps) {
  return (
    <section
      data-slot="class-empty-panel"
      style={{
        boxSizing: "border-box",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        background: "var(--linear-color-panel)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text weight="semibold">{title}</Text>
      </div>
      <Text size="sm" color="secondary">
        {emptyLabel}
      </Text>
    </section>
  );
}
