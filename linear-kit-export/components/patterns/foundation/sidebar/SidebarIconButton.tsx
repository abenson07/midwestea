"use client";

import type { ReactNode } from "react";
import {
  IconButton,
  type LinearIconButtonVariant,
} from "@/components/patterns/shared/IconButton";

/** @deprecated Prefer shared `IconButton` — kept as a sidebar alias. */
export type SidebarIconButtonVariant = "ghost" | "emphasis" | "primary" | "secondary";

export type SidebarIconButtonProps = {
  label: string;
  icon: ReactNode;
  variant?: SidebarIconButtonVariant;
  onClick?: () => void;
  isActive?: boolean;
};

/**
 * Sidebar icon control — maps onto shared Linear `IconButton`.
 * `emphasis` is an alias of `primary` (Create / Compose).
 */
export function SidebarIconButton({
  label,
  icon,
  variant = "ghost",
  onClick,
  isActive = false,
}: SidebarIconButtonProps) {
  const mapped: LinearIconButtonVariant =
    variant === "emphasis" || variant === "primary"
      ? "primary"
      : variant === "secondary"
        ? "secondary"
        : "ghost";

  return (
    <IconButton
      label={label}
      icon={icon}
      variant={mapped}
      onClick={onClick}
      isActive={isActive}
      size="sm"
    />
  );
}
