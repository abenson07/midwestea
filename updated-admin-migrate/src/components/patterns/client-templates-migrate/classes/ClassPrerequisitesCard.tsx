"use client";

import { CheckCircle2 } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";

export type ClassPrerequisitesCardProps = {
  items: string[];
};

/** Left-rail checklist of items required to enroll in the class. */
export function ClassPrerequisitesCard({ items }: ClassPrerequisitesCardProps) {
  return (
    <section
      data-slot="class-prerequisites-card"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        background: "var(--linear-color-panel)",
      }}
    >
      <Text weight="semibold">Prerequisites</Text>
      {items.length ? (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((item) => (
            <li key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2
                size={14}
                strokeWidth={1.75}
                style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
              />
              <Text size="sm">{item}</Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="sm" color="secondary">
          No prerequisites yet.
        </Text>
      )}
    </section>
  );
}
