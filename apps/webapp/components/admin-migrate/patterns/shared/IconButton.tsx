"use client";

import type { CSSProperties, ReactNode } from "react";
import { IconButton as BaseIconButton } from "@/components/admin-migrate/patterns/primitives/IconButton";

export type LinearIconButtonVariant = "ghost" | "primary" | "secondary";

export type LinearIconButtonProps = {
  label: string;
  icon: ReactNode;
  /**
   * - `ghost` — icon only, no chrome (search, topbar `+`)
   * - `primary` — circular fill wash, brighter icon (Create issue / Compose)
   * - `secondary` — circular hairline, muted icon (Add filter)
   */
  variant?: LinearIconButtonVariant;
  onClick?: () => void;
  isDisabled?: boolean;
  /** Selected / menu-open wash. */
  isActive?: boolean;
  size?: "sm" | "md";
};

const sizes = {
  sm: 24,
  md: 28,
} as const;

/**
 * Linear-styled icon button built on Astryx `IconButton`.
 */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  onClick,
  isDisabled = false,
  isActive = false,
  size = "md",
}: LinearIconButtonProps) {
  const px = sizes[size];

  const iconSlot = (
    <span
      style={{
        display: "inline-flex",
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
        color: "inherit",
      }}
    >
      {icon}
    </span>
  );

  if (variant === "ghost") {
    return (
      <BaseIconButton
        label={label}
        icon={iconSlot}
        variant="ghost"
        size="sm"
        onClick={onClick}
        isDisabled={isDisabled}
        style={{
          width: px,
          height: px,
          minWidth: px,
          minHeight: px,
          color: "var(--linear-color-ink-subtle)",
          ...(isActive
            ? {
                background: "var(--linear-color-sidebar-item-selected)",
                borderRadius: 6,
              }
            : null),
        }}
      />
    );
  }

  const isPrimary = variant === "primary";

  const chromeStyle: CSSProperties = {
    boxSizing: "border-box",
    width: px,
    height: px,
    minWidth: px,
    minHeight: px,
    padding: 0,
    borderRadius: 999,
    color: isPrimary
      ? "var(--linear-color-ink)"
      : "var(--linear-color-ink-subtle)",
    background: isPrimary
      ? "var(--linear-color-sidebar-item-selected)"
      : isActive
        ? "var(--linear-color-sidebar-item-selected)"
        : "var(--linear-color-icon-button-secondary)",
    border: isPrimary
      ? "var(--linear-border-width) solid transparent"
      : "var(--linear-border-width) solid var(--linear-color-hairline)",
  };

  return (
    <BaseIconButton
      label={label}
      icon={iconSlot}
      variant="ghost"
      size="sm"
      onClick={onClick}
      isDisabled={isDisabled}
      style={chromeStyle}
    />
  );
}
