"use client";

import { ChevronRight } from "lucide-react";

export type TryButtonProps = {
  label?: string;
  onClick?: () => void;
};

export function TryButton({ label = "Try", onClick }: TryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
        fontWeight: 500,
      }}
    >
      {label}
      <ChevronRight size={12} strokeWidth={2} />
    </button>
  );
}
