"use client";

import type { ReactNode } from "react";

export type SidebarScrollAreaProps = {
  children: ReactNode;
};

export function SidebarScrollArea({ children }: SidebarScrollAreaProps) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
