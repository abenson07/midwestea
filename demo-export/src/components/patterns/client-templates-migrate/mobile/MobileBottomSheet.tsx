"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Taller sheet for forms */
  size?: "default" | "tall";
};

export function MobileBottomSheet({
  open,
  onClose,
  title,
  children,
  size = "default",
}: MobileBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxHeight = size === "tall" ? "92vh" : "78vh";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Details"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(0,0,0,0.45)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: "var(--linear-color-side-panel, var(--linear-color-canvas))",
          borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "var(--linear-color-hairline)",
            }}
          />
        </div>
        {title ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "4px 16px 12px",
              borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 600,
                color: "var(--linear-color-ink)",
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: "var(--linear-color-ink-subtle)",
                cursor: "pointer",
              }}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "12px 16px 8px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
