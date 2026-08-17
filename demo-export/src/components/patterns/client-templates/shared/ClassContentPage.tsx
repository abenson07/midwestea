"use client";

import type { ReactNode } from "react";

export type ClassContentPageProps = {
  children: ReactNode;
};

/**
 * Same padding/gap as Foundation's `MixedContentPage` — kept as its own
 * component so class-detail pages can diverge from the shared Foundation
 * wrapper without editing it directly.
 */
export function ClassContentPage({ children }: ClassContentPageProps) {
  return (
    <div
      data-slot="class-content-page"
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {children}
    </div>
  );
}
