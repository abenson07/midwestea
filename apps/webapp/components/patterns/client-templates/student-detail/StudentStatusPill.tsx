"use client";

import type { StudentSummary } from "@/data/mocks/student-detail";

const STATUS_META: Record<
  StudentSummary["status"],
  { label: string; color: string }
> = {
  active: { label: "Active", color: "#27a644" },
  inactive: { label: "Inactive", color: "#8a8f98" },
  graduated: { label: "Graduated", color: "#5e6ad2" },
};

export type StudentStatusPillProps = {
  status: StudentSummary["status"];
};

/** Student status pill — sits in the canvas title-bar next to the name. */
export function StudentStatusPill({ status }: StudentStatusPillProps) {
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
