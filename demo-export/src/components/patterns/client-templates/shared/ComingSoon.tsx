"use client";

import { Construction } from "lucide-react";

export type ComingSoonProps = {
  label: string;
  /** Render as a full-bleed page instead of an inline section. */
  fullPage?: boolean;
};

/** Placeholder for sections/pages not wired up yet in admin-migrate. */
export function ComingSoon({ label, fullPage }: ComingSoonProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: fullPage ? "80px 24px" : "32px 20px",
        height: fullPage ? "100%" : undefined,
        color: "var(--linear-color-ink-subtle)",
        background: fullPage ? undefined : "var(--linear-color-panel)",
        border: fullPage ? undefined : "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: fullPage ? undefined : "var(--linear-radius-md)",
        boxShadow: fullPage ? undefined : "var(--linear-shadow-panel)",
      }}
    >
      <Construction size={20} strokeWidth={1.5} />
      <span style={{ fontSize: 13 }}>{label} — coming soon</span>
    </div>
  );
}
