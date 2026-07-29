"use client";

import type { ClassSummary } from "@/data/mocks/class-detail";

const STATUS_META: Record<
  ClassSummary["status"],
  { label: string; color: string }
> = {
  enrolling: { label: "Currently enrolling", color: "#27a644" },
  "in-progress": { label: "Active enrollment", color: "#5e6ad2" },
  closed: { label: "Closed", color: "#8a8f98" },
};

export type ClassStatusPillProps = {
  status: ClassSummary["status"];
};

/** Enrollment status pill — sits in the canvas title-bar next to the title. */
export function ClassStatusPill({ status }: ClassStatusPillProps) {
  const meta = STATUS_META[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: meta.color,
        }}
      />
      {meta.label}
    </span>
  );
}
