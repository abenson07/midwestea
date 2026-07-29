"use client";

import type { ReactNode } from "react";

export type SidebarHeaderActionsProps = {
  children: ReactNode;
};

export function SidebarHeaderActions({ children }: SidebarHeaderActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
