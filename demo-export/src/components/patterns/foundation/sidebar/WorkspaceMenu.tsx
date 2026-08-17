"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "@/components/patterns/shared/dropdown";
import { WorkspaceMark } from "./WorkspaceMark";

export type WorkspaceMenuProps = {
  name: string;
  icon?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WorkspaceMenu({
  name,
  icon,
  children,
  open,
  onOpenChange,
}: WorkspaceMenuProps) {
  const trigger = (
    <button
      type="button"
      aria-label={`${name} Workspace Menu`}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minWidth: 0,
        flex: 1,
        borderRadius: 6,
        padding: "4px 6px",
        color: "var(--linear-color-ink)",
      }}
    >
      {icon ?? <WorkspaceMark />}
      <span
        style={{
          fontSize: 13,
          lineHeight: "20px",
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      <ChevronDown
        size={12}
        strokeWidth={2}
        style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
      />
    </button>
  );

  if (!children) {
    return trigger;
  }

  return (
    <Dropdown
      label={`${name} Workspace Menu`}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      width={220}
    >
      {children}
    </Dropdown>
  );
}
