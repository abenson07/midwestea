"use client";

import type { ReactNode } from "react";
import { PenSquare } from "lucide-react";

export type EmptyStateCardProps = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
};

/**
 * Outlined empty-state affordance — same treatment as the mixed-content
 * "Write first initiative update" CTA, generalized for any section.
 */
export function EmptyStateCard({ label, icon, onClick }: EmptyStateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        height: 36,
        borderRadius: 8,
        border:
          "var(--linear-border-width) solid var(--linear-color-hairline)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      {icon ?? <PenSquare size={14} strokeWidth={1.75} />}
      {label}
    </button>
  );
}
