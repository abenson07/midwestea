"use client";

import type { LucideIcon } from "lucide-react";

export type IconSize = "xsm" | "sm" | "md";
export type IconColor = "primary" | "secondary" | "accent";

export type IconProps = {
  icon: LucideIcon;
  size?: IconSize;
  color?: IconColor;
};

const sizePx: Record<IconSize, number> = { xsm: 12, sm: 16, md: 20 };

const colorVar: Record<IconColor, string> = {
  primary: "var(--linear-color-ink)",
  secondary: "var(--linear-color-ink-subtle)",
  accent: "var(--linear-color-accent)",
};

export function Icon({ icon: IconComponent, size = "md", color = "primary" }: IconProps) {
  return (
    <IconComponent
      size={sizePx[size]}
      strokeWidth={1.75}
      style={{ color: colorVar[color] }}
    />
  );
}
