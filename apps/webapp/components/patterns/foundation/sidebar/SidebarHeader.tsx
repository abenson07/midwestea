"use client";

import type { ReactNode } from "react";

export type SidebarHeaderProps = {
  children: ReactNode;
};

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        minHeight: 32,
        paddingInline: 4,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}
