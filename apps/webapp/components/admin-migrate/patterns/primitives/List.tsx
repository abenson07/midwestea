"use client";

import type { ReactNode } from "react";

export type ListProps = {
  children?: ReactNode;
  header?: ReactNode;
  density?: "compact" | "regular";
};

export function List({ children, header }: ListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {header ? <div style={{ paddingInline: 4 }}>{header}</div> : null}
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

export type ListItemProps = {
  label: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  onClick?: () => void;
};

export function ListItem({ label, startContent, endContent, onClick }: ListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        height: 32,
        paddingInline: 4,
        borderRadius: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--linear-color-sidebar-item-selected)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      {startContent ? (
        <span style={{ display: "inline-flex", width: 16, height: 16, flexShrink: 0 }}>
          {startContent}
        </span>
      ) : null}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {endContent}
    </button>
  );
}
