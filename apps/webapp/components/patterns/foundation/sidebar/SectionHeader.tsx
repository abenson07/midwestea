"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type SectionHeaderProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  action?: ReactNode;
};

export function SectionHeader({
  label,
  expanded,
  onToggle,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className="sidebar-section-header"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        minHeight: 24,
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          minHeight: 24,
          paddingInline: 8,
          paddingRight: action ? 32 : 8,
          flex: 1,
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 500,
            color: "inherit",
          }}
        >
          {label}
        </span>
        {expanded ? (
          <ChevronDown size={12} strokeWidth={2} />
        ) : (
          <ChevronRight size={12} strokeWidth={2} />
        )}
      </button>
      {action ? (
        <span
          className="sidebar-section-header-action"
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
