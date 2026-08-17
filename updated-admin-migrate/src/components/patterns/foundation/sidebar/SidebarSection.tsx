"use client";

import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

export type SidebarSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SidebarSection({ title, action, children }: SidebarSectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SectionHeader label={title} action={action} />
      {children}
    </div>
  );
}
