"use client";

import { useState, type ReactNode } from "react";
import { MenuItem } from "./MenuItem";

export type SidebarGroupProps = {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  action?: ReactNode;
  onSelect?: () => void;
  children: ReactNode;
};

export function SidebarGroup({
  label,
  icon,
  selected = false,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  action,
  onSelect,
  children,
}: SidebarGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : uncontrolled;

  const setExpanded = (next: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  return (
    <div>
      <MenuItem
        label={label}
        icon={icon}
        selected={selected}
        action={action}
        expanded={expanded}
        hugExpand
        onClick={onSelect}
        onExpandClick={() => setExpanded(!expanded)}
      />
      {expanded ? children : null}
    </div>
  );
}
