"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export type DropdownSubmenuProps = {
  label: string;
  children: ReactNode;
};

/** Nested flyout — opens to the left so right-aligned filter menus stay on screen. */
export function DropdownSubmenu({ label, children }: DropdownSubmenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          height: 32,
          minHeight: 32,
          paddingInline: 10,
          borderRadius: 6,
          color: "var(--linear-color-sidebar-item-idle)",
          background: open ? "var(--linear-color-sidebar-item-selected)" : "transparent",
          fontSize: 13,
          lineHeight: "20px",
          whiteSpace: "nowrap",
          cursor: "default",
        }}
      >
        <span>{label}</span>
        <ChevronRight size={14} strokeWidth={1.75} />
      </div>
      {open ? (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: "calc(100% + 4px)",
            top: 0,
            zIndex: 2,
            boxSizing: "border-box",
            minWidth: 240,
            maxWidth: 280,
            padding: 4,
            borderRadius: 8,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            boxShadow: "var(--linear-shadow-canvas)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
