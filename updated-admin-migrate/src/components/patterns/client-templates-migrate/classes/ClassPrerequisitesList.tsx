"use client";

import { CheckCircle2 } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { ClassSidebarSection } from "./ClassSidebarSection";

export type ClassPrerequisitesListProps = {
  items: string[];
};

/** Required items as an activity-style list. */
export function ClassPrerequisitesList({ items }: ClassPrerequisitesListProps) {
  return (
    <ClassSidebarSection title="Prerequisites">
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
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <CheckCircle2
                size={14}
                strokeWidth={1.75}
                style={{
                  color: "var(--linear-color-ink-subtle)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <Text size="sm" color="secondary">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="sm" color="secondary">
          No prerequisites yet.
        </Text>
      )}
    </ClassSidebarSection>
  );
}
