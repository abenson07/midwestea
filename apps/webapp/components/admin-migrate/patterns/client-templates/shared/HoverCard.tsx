"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { linearTokenVars } from "@/theme/linearTokens";

export type HoverCardProps = {
  content: ReactNode;
  children: ReactNode;
  delayMs?: number;
};

const CARD_WIDTH = 280;
const GAP = 8;

/** Linear-style hover card, anchored to the right of the trigger. */
export function HoverCard({ content, children, delayMs = 220 }: HoverCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function place() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(rect.right + GAP, window.innerWidth - CARD_WIDTH - GAP);
    const top = Math.max(GAP, Math.min(rect.top, window.innerHeight - 160));
    setPos({ top, left: Math.max(GAP, left) });
  }

  function show() {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      place();
      setOpen(true);
    }, delayMs);
  }

  function hide() {
    clearTimer();
    setOpen(false);
  }

  useEffect(() => () => clearTimer(), []);

  return (
    <>
      <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide} style={{ width: "100%" }}>
        {children}
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              style={
                {
                  ...linearTokenVars,
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  zIndex: 120,
                  boxSizing: "border-box",
                  width: CARD_WIDTH,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--linear-color-side-panel)",
                  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                  boxShadow: "var(--linear-shadow-side-panel)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
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
