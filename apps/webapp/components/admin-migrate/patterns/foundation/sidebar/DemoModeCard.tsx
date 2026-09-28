"use client";

import { ChevronRight, FlaskConical } from "lucide-react";

export type DemoModeCardProps = {
  onExitClick: () => void;
};

/** Persistent lower-sidebar reminder that demo mode is active, with an exit affordance. */
export function DemoModeCard({ onExitClick }: DemoModeCardProps) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        marginBottom: 8,
        borderRadius: "var(--linear-radius-md)",
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        background: "var(--linear-color-sidebar-item-selected)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <FlaskConical
          size={14}
          strokeWidth={1.75}
          style={{ color: "var(--linear-color-accent)", flexShrink: 0, marginTop: 1 }}
        />
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          Currently in demo mode. Changes are saved on this device only — not to the database.
        </span>
      </div>
      <button
        type="button"
        onClick={onExitClick}
        style={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 500,
          color: "var(--linear-color-accent)",
        }}
      >
        Exit demo mode
        <ChevronRight size={12} strokeWidth={2} />
      </button>
    </div>
  );
}
