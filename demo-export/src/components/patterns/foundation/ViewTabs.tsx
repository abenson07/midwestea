"use client";

import type { ReactNode } from "react";

export type ViewTabsProps = {
  children: ReactNode;
  /** Trailing slot (e.g. filter icon) — pinned to the end of the row. */
  endContent?: ReactNode;
  "aria-label"?: string;
};

/**
 * Horizontal row of Linear view tabs (Active / Planned / …).
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
        justifyContent: endContent ? "space-between" : "flex-start",
        gap: 8,
        width: "100%",
        minHeight: 44,
        boxSizing: "border-box",
      }}
    >
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
