"use client";

import { PropertyChipRow } from "@/components/patterns/client-templates/shared";
import { defaultInitiativeProperties } from "@/components/patterns/foundation/mixed-content";
import type { ClassSummary } from "@/data/mocks/class-detail";

export type ClassInfoBoxProps = {
  summary: ClassSummary;
};

/**
 * Top bounding box for the class detail page — title, enrollment summary,
 * and property chips. Status pill lives in the canvas title-bar; lifecycle
 * actions live in its more menu.
 */
export function ClassInfoBox({ summary }: ClassInfoBoxProps) {
  return (
    <header
      data-slot="class-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        border:
          "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--linear-color-ink)",
          }}
        >
          {summary.name}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          {summary.program} · {summary.term} · {summary.teacher} ·{" "}
          {summary.enrolledCount}/{summary.capacity} enrolled
        </p>
      </div>

      <PropertyChipRow properties={defaultInitiativeProperties} />
    </header>
  );
}
