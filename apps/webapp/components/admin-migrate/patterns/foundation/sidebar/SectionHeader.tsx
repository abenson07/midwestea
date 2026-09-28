"use client";

import type { ReactNode } from "react";

export type SectionHeaderProps = {
  label: string;
  action?: ReactNode;
};

export function SectionHeader({ label, action }: SectionHeaderProps) {
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
      <div
        style={{
          boxSizing: "border-box",
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
      </div>
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
