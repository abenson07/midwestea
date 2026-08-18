"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItemCount } from "./MenuItemCount";

export type MenuItemProps = {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  count?: number;
  /** Hide `count` until the row is hovered or focused. */
  countOnHover?: boolean;
  depth?: number;
  onClick?: () => void;
  action?: ReactNode;
  /** Always-visible trailing marker (e.g. a status dot) — unlike `action`, not hidden until hover. */
  indicator?: ReactNode;
  expanded?: boolean;
  onExpandClick?: () => void;
  hugExpand?: boolean;
};

export function MenuItem({
  label,
  icon,
  selected = false,
  count,
  countOnHover = false,
  depth = 0,
  onClick,
  action,
  indicator,
  expanded,
  onExpandClick,
  hugExpand = false,
}: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpandable = expanded !== undefined || onExpandClick != null;
  const foreground = selected
    ? "var(--linear-color-ink)"
    : "var(--linear-color-sidebar-item-idle)";
  const background = selected || isHovered
    ? "var(--linear-color-sidebar-item-selected)"
    : "transparent";

  return (
    <div
      className="sidebar-menu-item"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={() => {
          onClick?.();
          if (isExpandable) onExpandClick?.();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          height: 28,
          paddingInline: 8,
          paddingLeft: 8 + depth * 14,
          paddingRight: action ? 32 : 8,
          borderRadius: 6,
          color: foreground,
          background,
        }}
      >
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
        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 13,
            lineHeight: "20px",
            fontWeight: selected ? 500 : 400,
            color: "inherit",
            ...(hugExpand ? {} : isExpandable ? { flex: 1 } : {}),
          }}
        >
          {label}
        </span>
        {isExpandable ? (
          <span
            style={{
              display: "inline-flex",
              flexShrink: 0,
              color: "inherit",
              opacity: 0.7,
            }}
          >
            {expanded ? (
              <ChevronDown size={12} strokeWidth={2} />
            ) : (
              <ChevronRight size={12} strokeWidth={2} />
            )}
          </span>
        ) : null}
        {count != null ? (
          <MenuItemCount
            value={count}
            label={`${count} ${label}`}
            hiddenUntilHover={countOnHover}
          />
        ) : null}
        {indicator ? (
          <span
            style={{
              display: "inline-flex",
              flexShrink: 0,
              marginLeft: count == null ? "auto" : 0,
            }}
          >
            {indicator}
          </span>
        ) : null}
      </button>
      {action ? (
        <span
          className="sidebar-menu-item-action"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
          }}
        >
          {action}
        </span>
      ) : null}
    </div>
  );
}
