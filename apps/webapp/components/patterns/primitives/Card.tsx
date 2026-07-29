"use client";

import type { CSSProperties, ReactNode } from "react";

export type CardProps = {
  children?: ReactNode;
  padding?: number;
  style?: CSSProperties;
};

export function Card({ children, padding = 4, style }: CardProps) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: padding * 4,
        borderRadius: "var(--linear-radius-md)",
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        background: "var(--linear-color-canvas)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
