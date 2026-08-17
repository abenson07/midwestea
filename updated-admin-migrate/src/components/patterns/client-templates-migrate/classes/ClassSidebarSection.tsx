"use client";

import type { CSSProperties, ReactNode } from "react";
import { Text } from "@/components/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";

export type ClassSidebarSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

const sectionStyle: CSSProperties = {
  ...cardSurfaceStyle,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 14,
};

/** Grouped right-rail card — Linear project sidebar chrome. */
export function ClassSidebarSection({ title, action, children }: ClassSidebarSectionProps) {
  return (
    <section style={sectionStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 20,
        }}
      >
        <Text weight="semibold">{title}</Text>
        {action}
      </div>
      {children}
    </section>
  );
}
