"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { linearTokenVars } from "@/theme/linearTokens";

export type HoverTooltipProps = {
  content: ReactNode;
  children: ReactNode;
};

/** Fixed Linear hover tooltip — same chrome as the students-table class list. */
export function HoverTooltip({ content, children }: HoverTooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function show(event: MouseEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.bottom + 6 });
  }

  return (
    <>
      <span onMouseEnter={show} onMouseLeave={() => setPos(null)}>
        {children}
      </span>
      {pos && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              style={
                {
                  ...linearTokenVars,
                  position: "fixed",
                  left: pos.x,
                  top: pos.y,
                  zIndex: 80,
                  boxSizing: "border-box",
                  minWidth: 140,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "var(--linear-color-side-panel)",
                  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                  boxShadow: "var(--linear-shadow-side-panel)",
                  color: "var(--linear-color-ink)",
                  fontSize: 12,
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                } as CSSProperties
              }
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
