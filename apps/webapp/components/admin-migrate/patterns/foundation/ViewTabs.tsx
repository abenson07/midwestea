"use client";

import type { ReactNode } from "react";

export type ViewTabsProps = {
  children?: ReactNode;
  /** Trailing slot (e.g. filter icon) — pinned to the end of the row. */
  endContent?: ReactNode;
  "aria-label"?: string;
};

/**
 * Horizontal row of Linear view tabs (Active / Planned / …).
 * `endContent` stays right-aligned even when there are no tabs.
 */
export function ViewTabs({
  children,
  endContent,
  "aria-label": ariaLabel = "Views",
}: ViewTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          children != null && endContent ? "space-between" : endContent ? "flex-end" : "flex-start",
        gap: 8,
        width: "100%",
        minHeight: 44,
        boxSizing: "border-box",
      }}
    >
      {children != null ? (
        <div
          role="tablist"
          aria-label={ariaLabel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          {children}
        </div>
      ) : null}
      {endContent ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          {endContent}
        </div>
      ) : null}
    </div>
  );
}
