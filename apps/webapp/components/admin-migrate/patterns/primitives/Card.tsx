"use client";

import type { CSSProperties, ReactNode } from "react";

export type CardProps = {
  children?: ReactNode;
  padding?: number;
  style?: CSSProperties;
};

/** Shared surface for bordered content boxes — matches Event Details/Settings cards. */
export const cardSurfaceStyle: CSSProperties = {
  background: "var(--linear-color-panel)",
  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
  borderRadius: "var(--linear-radius-md)",
  boxShadow: "var(--linear-shadow-panel)",
};

export function Card({ children, padding = 4, style }: CardProps) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: padding * 4,
        ...cardSurfaceStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
