"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/patterns/primitives/Text";

export type ContentListRowProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
};

export function ContentListRow({ icon, title, subtitle, onClick }: ContentListRowProps) {
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
        gap: 12,
        width: "100%",
        padding: 12,
        borderRadius: "var(--linear-radius-md)",
        background: "var(--linear-color-icon-button-secondary)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--linear-color-sidebar-item-selected)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "var(--linear-color-icon-button-secondary)";
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "var(--linear-radius-md)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, textAlign: "left" }}>
        <Text
          weight="semibold"
          display="block"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {title}
        </Text>
        <Text
          color="secondary"
          size="sm"
          display="block"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {subtitle}
        </Text>
      </span>
    </button>
  );
}
