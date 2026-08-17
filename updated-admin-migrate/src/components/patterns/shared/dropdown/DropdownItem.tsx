"use client";

import type { ReactNode } from "react";

export type DropdownItemProps = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function DropdownItem({
  label,
  icon,
  onSelect,
  selected = false,
  disabled = false,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        height: 32,
        paddingInline: 10,
        borderRadius: 6,
        color: selected
          ? "var(--linear-color-ink)"
          : "var(--linear-color-sidebar-item-idle)",
        background: selected
          ? "var(--linear-color-sidebar-item-selected)"
          : "transparent",
        opacity: disabled ? 0.5 : 1,
        fontSize: 13,
        lineHeight: "20px",
      }}
      onMouseEnter={(event) => {
        if (!disabled && !selected) {
          event.currentTarget.style.background =
            "var(--linear-color-sidebar-item-selected)";
        }
      }}
      onMouseLeave={(event) => {
        if (!selected) {
          event.currentTarget.style.background = "transparent";
        }
      }}
    >
      {icon ? (
        <span
          style={{
            display: "inline-flex",
            width: 16,
            height: 16,
            flexShrink: 0,
            color: "inherit",
          }}
        >
          {icon}
        </span>
      ) : null}
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
    </button>
  );
}
