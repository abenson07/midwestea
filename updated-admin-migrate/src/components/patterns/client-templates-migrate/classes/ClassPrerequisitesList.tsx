"use client";

import { CheckCircle2 } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";

export type ClassPrerequisitesListProps = {
  items: string[];
};

/** Right-rail properties-style list of prerequisite items — no card chrome, mirrors `ClassDetailsCard`. */
export function ClassPrerequisitesList({ items }: ClassPrerequisitesListProps) {
  return (
    <section
      data-slot="class-prerequisites-list"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
