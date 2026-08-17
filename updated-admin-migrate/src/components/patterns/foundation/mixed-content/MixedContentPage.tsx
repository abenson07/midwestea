"use client";

import type { ReactNode } from "react";

export type MixedContentPageProps = {
  children: ReactNode;
};

/**
 * Mixed-content body padding. Width is owned by Foundation’s centered rail
 * (`contentMaxWidth`) so the properties column can sit beside this content
 * inside the same max-width.
 */
export function MixedContentPage({ children }: MixedContentPageProps) {
  return (
    <div
      data-slot="mixed-content-page"
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
