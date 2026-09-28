"use client";

import type { CSSProperties, ReactNode } from "react";

export type IconButtonProps = {
  label: string;
  icon: ReactNode;
  variant?: "ghost" | "primary" | "secondary";
  size?: "sm" | "md";
  onClick?: () => void;
  isDisabled?: boolean;
  style?: CSSProperties;
};

/** Low-level native-button primitive — visual treatment is applied by callers via `style`. */
export function IconButton({
  label,
  icon,
  size = "sm",
  onClick,
  isDisabled = false,
  style,
}: IconButtonProps) {
  const px = size === "sm" ? 24 : 28;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: isDisabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        borderRadius: 6,
        color: "var(--linear-color-ink-subtle)",
        opacity: isDisabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon}
    </button>
  );
}
