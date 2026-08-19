"use client";

import type { ReactNode } from "react";
import {
  Popover,
  type LayerAlignment,
  type LayerPlacement,
} from "@/components/admin-migrate/patterns/primitives/Popover";

export type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  label?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
  width?: number | string;
};

/**
 * Menu anchored to a trigger. One styled `role="menu"` surface —
 * Popover padding/chrome is cleared so items aren’t double-wrapped.
 */
export function Dropdown({
  trigger,
  children,
  label = "Menu",
  open,
  onOpenChange,
  placement = "below",
  alignment = "start",
  width = 174,
}: DropdownProps) {
  return (
    <Popover
      label={label}
      placement={placement}
      alignment={alignment}
      width={width}
      isOpen={open}
      onOpenChange={onOpenChange}
      hasCloseButton={false}
      style={{
        padding: 0,
        background: "transparent",
        border: "none",
        boxShadow: "none",
      }}
      content={
        <div
          role="menu"
          style={{
            boxSizing: "border-box",
            padding: 4,
            borderRadius: 8,
            background: "var(--linear-color-canvas)",
            border:
              "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            boxShadow: "var(--linear-shadow-canvas)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {children}
        </div>
      }
    >
      {trigger}
    </Popover>
  );
}
