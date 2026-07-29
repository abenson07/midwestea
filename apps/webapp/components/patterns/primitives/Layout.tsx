"use client";

import type { AriaRole, CSSProperties, ReactNode } from "react";

export type LayoutContentProps = {
  children?: ReactNode;
  padding?: number;
  role?: AriaRole;
};

export function LayoutContent({ children, padding = 0, role }: LayoutContentProps) {
  return (
    <div
      role={role}
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: padding * 4,
      }}
    >
      {children}
    </div>
  );
}

export type LayoutProps = {
  content: ReactNode;
  end?: ReactNode;
  height?: "fill" | "auto";
  padding?: number;
};

/** Two-pane row: main content (flex) + an optional fixed-width end column. */
export function Layout({ content, end, height = "auto", padding = 0 }: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: height === "fill" ? "100%" : "auto",
        minHeight: 0,
        boxSizing: "border-box",
        padding: padding * 4,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, height: "100%" }}>{content}</div>
      {end}
    </div>
  );
}

export type LayoutPanelProps = {
  children?: ReactNode;
  width?: number;
  padding?: number;
  hasDivider?: boolean;
  isScrollable?: boolean;
  role?: AriaRole;
  label?: string;
  style?: CSSProperties;
};

export function LayoutPanel({
  children,
  width = 280,
  padding = 0,
  hasDivider = true,
  isScrollable = false,
  role,
  label,
  style,
}: LayoutPanelProps) {
  return (
    <div
      role={role}
      aria-label={label}
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        boxSizing: "border-box",
        padding: padding * 4,
        overflow: isScrollable ? "auto" : "visible",
        borderLeft: hasDivider
          ? "var(--linear-border-width) solid var(--linear-color-hairline)"
          : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
