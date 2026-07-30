"use client";

import type { ReactNode } from "react";

export type OutlinedPanelProps = {
  children: ReactNode;
  width?: number;
};

/**
 * Side-content variant that reads as its own surface — outlined like
 * `EmptyStateCard`, lifted off the canvas with a background a shade
 * lighter than it — rather than sitting flush like `SideContentBar`.
 * Follows the app's light/dark mode like everything else.
 */
export function OutlinedPanel({ children, width = 320 }: OutlinedPanelProps) {
  return (
    <div
      role="complementary"
      style={{
        boxSizing: "border-box",
        width,
        flexShrink: 0,
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        background: "var(--linear-color-icon-button-secondary)",
        border:
          "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}
