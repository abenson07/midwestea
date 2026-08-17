"use client";

import type { ReactNode } from "react";

export type BadgeProps = {
  label: string;
  icon?: ReactNode;
  variant?: "neutral";
};

export function Badge({ label, icon }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
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
      {icon}
      {label}
    </span>
  );
}
