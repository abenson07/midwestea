"use client";

import { useState, type ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

export type SidebarSectionProps = {
  title: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  action?: ReactNode;
  children: ReactNode;
};

export function SidebarSection({
  title,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  action,
  children,
}: SidebarSectionProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : uncontrolled;

  const setExpanded = (next: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SectionHeader
        label={title}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        action={action}
      />
      {expanded ? children : null}
    </div>
  );
}
