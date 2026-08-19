"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/admin-migrate/patterns/primitives/Card";

export type AccordionSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Bordered collapsible section — rotating chevron, same collapse model as `GroupedTable`. */
export function AccordionSection({ title, defaultOpen = false, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ ...cardSurfaceStyle, overflow: "hidden" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          all: "unset",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "10px 12px",
          cursor: "pointer",
        }}
      >
        <ChevronRight
          size={12}
          strokeWidth={2}
          style={{
            color: "var(--linear-color-ink-subtle)",
            flexShrink: 0,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.1s ease",
          }}
        />
        <Text weight="medium">{title}</Text>
      </button>
      {open ? (
        <div
          style={{
            boxSizing: "border-box",
            padding: "0 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
