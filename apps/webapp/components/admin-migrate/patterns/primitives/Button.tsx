"use client";

import type { ReactNode } from "react";

export type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  width?: number | string;
  icon?: ReactNode;
  isIconOnly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  label,
  variant = "secondary",
  size = "sm",
  width,
  icon,
  isIconOnly = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const height = size === "sm" ? 28 : 32;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={isIconOnly ? label : undefined}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
        width: width ?? (isIconOnly ? height : undefined),
        height,
        paddingInline: isIconOnly ? 0 : 12,
        whiteSpace: "nowrap",
        borderRadius: 6,
        fontSize: 13,
        lineHeight: "20px",
        fontWeight: 500,
        textAlign: "center",
        background: isPrimary
          ? "var(--linear-color-accent)"
          : isGhost
            ? "transparent"
            : "var(--linear-color-icon-button-secondary)",
        color: isPrimary ? "var(--linear-color-on-accent)" : "var(--linear-color-ink)",
        border: isGhost
          ? "none"
          : "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      {icon}
      {!isIconOnly ? label : null}
    </button>
  );
}
