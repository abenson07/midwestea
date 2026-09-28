"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/admin-migrate/patterns/primitives/Card";

export type ClassBannerProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

/** Clickable summary banner — collapses a table into one line, opens a modal with the full list. */
export function ClassBanner({ icon, label, onClick }: ClassBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        ...cardSurfaceStyle,
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px",
        width: "100%",
        minWidth: 0,
      }}
    >
      <span style={{ display: "inline-flex", color: "var(--linear-color-ink-subtle)" }}>{icon}</span>
      <Text weight="medium" style={{ flex: 1, minWidth: 0 }}>
        {label}
      </Text>
      <ChevronRight size={14} strokeWidth={1.75} color="var(--linear-color-ink-subtle)" />
    </button>
  );
}
