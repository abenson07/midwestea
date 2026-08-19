"use client";

import type { ReactNode } from "react";
import { List } from "@/components/admin-migrate/patterns/primitives/List";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type SideContentSectionProps = {
  title: string;
  children: ReactNode;
};

/**
 * Labeled group of side-rail fields — Astryx `List` with a section header.
 */
export function SideContentSection({
  title,
  children,
}: SideContentSectionProps) {
  return (
    <List
      density="compact"
      header={
        <Text type="label" color="secondary">
          {title}
        </Text>
      }
    >
      {children}
    </List>
  );
}
