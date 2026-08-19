"use client";

import type { CSSProperties, ReactNode } from "react";
import { PenSquare } from "lucide-react";

export type EmptyStateCardProps = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  /**
   * `pill` — tall empty frame with a centered pill CTA (Linear project updates).
   * `plain` — tall empty frame with centered icon + label, no pill chrome (Linear resources).
   */
  variant?: "pill" | "plain";
  /** Minimum height of the empty frame. Defaults: pill 96, plain 88. */
  minHeight?: number;
};

const frameStyle = (minHeight: number): CSSProperties => ({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight,
  padding: "28px 20px",
  borderRadius: "var(--linear-radius-md)",
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-sidebar-item-selected)",
});

const ctaRowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 13,
  lineHeight: "20px",
  fontWeight: 500,
  color: "var(--linear-color-ink-subtle)",
  whiteSpace: "nowrap",
};

const pillStyle: CSSProperties = {
  ...ctaRowStyle,
  padding: "6px 12px",
  borderRadius: 999,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-icon-button-secondary)",
  color: "var(--linear-color-ink)",
};

/**
 * Linear-style empty section — bordered hollow frame with a centered
 * compose CTA. Use `pill` for the primary “write first…” action, `plain`
 * for quieter section empties.
 */
export function EmptyStateCard({
  label,
  icon,
  onClick,
  variant = "pill",
  minHeight,
}: EmptyStateCardProps) {
  const height = minHeight ?? (variant === "pill" ? 96 : 88);
  const glyph = icon ?? <PenSquare size={14} strokeWidth={1.75} />;
  const interactive = Boolean(onClick);

  if (variant === "plain") {
    const content = (
      <>
        {glyph}
        {label}
      </>
    );

    if (interactive) {
      return (
        <button
          type="button"
          onClick={onClick}
          style={{
            all: "unset",
            ...frameStyle(height),
            ...ctaRowStyle,
            cursor: "pointer",
          }}
        >
          {content}
        </button>
      );
    }

    return (
      <div style={{ ...frameStyle(height), ...ctaRowStyle }} role="status">
        {content}
      </div>
    );
  }

  // pill
  const pill = (
    <span style={pillStyle}>
      {glyph}
      {label}
    </span>
  );

  if (interactive) {
    return (
      <div style={frameStyle(height)}>
        <button
          type="button"
          onClick={onClick}
          style={{
            all: "unset",
            ...pillStyle,
            cursor: "pointer",
          }}
        >
          {glyph}
          {label}
        </button>
      </div>
    );
  }

  return (
    <div style={frameStyle(height)} role="status">
      {pill}
    </div>
  );
}
