"use client";

import { useEffect, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";

export type OutlinedPanelProps = {
  children: ReactNode;
  width?: number | string;
  title?: string;
  /** When set, shows a close X top-right and closes on Escape. */
  onClose?: () => void;
  /** When set, shows an Edit pencil button top-right, to the left of the close X. */
  onEdit?: () => void;
};

/**
 * Side detail panel — opaque fill + floating shadow
 * (`--linear-color-side-panel` / `--linear-shadow-side-panel`), separate from
 * translucent content cards (`--linear-color-panel` at 50% opacity).
 */
export function OutlinedPanel({ children, width = 320, title, onClose, onEdit }: OutlinedPanelProps) {
  useEffect(() => {
    if (!onClose) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="complementary"
      style={{
        boxSizing: "border-box",
        width,
        maxWidth: "100%",
        flexShrink: 0,
        height: "fit-content",
        maxHeight: "100%",
        minHeight: 0,
        overflow: "auto",
        background: "var(--linear-color-side-panel)",
        border:
          "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-lg)",
        boxShadow: "var(--linear-shadow-side-panel)",
        padding: 16,
      }}
    >
      {title || onEdit || onClose ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 8,
            minHeight: 20,
          }}
        >
          {title ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                lineHeight: "20px",
                color: "var(--linear-color-ink)",
              }}
            >
              {title}
            </span>
          ) : (
            <span />
          )}
          {onEdit || onClose ? (
            <div style={{ display: "inline-flex", gap: 4, flexShrink: 0 }}>
              {onEdit ? (
                <IconButton
                  label="Edit"
                  variant="ghost"
                  size="sm"
                  icon={<Pencil size={16} strokeWidth={1.75} />}
                  onClick={onEdit}
                />
              ) : null}
              {onClose ? (
                <IconButton
                  label="Close"
                  variant="ghost"
                  size="sm"
                  icon={<X size={16} strokeWidth={1.75} />}
                  onClick={onClose}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
