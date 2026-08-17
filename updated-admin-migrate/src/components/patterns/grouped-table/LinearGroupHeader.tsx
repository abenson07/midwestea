"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type LinearGroupHeaderProps = {
  label: string;
  count: number;
  /** Status / project color dot. */
  color?: string;
  /** Trailing add control (Linear “+” on the group header). */
  onAdd?: () => void;
  addLabel?: string;
  /** Extra leading content after the color dot. */
  startContent?: ReactNode;
  endContent?: ReactNode;
  /** Quieter label/count for nested tables. @default "default" */
  tone?: "default" | "muted";
};

/**
 * Linear-style group header content (sits beside Astryx’s built-in chevron).
 * Default: Dot · label · count …………………… +
 * Muted:   label ───────────────────────────── (hairline, no fill)
 */
export function LinearGroupHeader({
  label,
  count,
  color = "#27a644",
  onAdd,
  addLabel = "Add",
  startContent,
  endContent,
  tone = "default",
}: LinearGroupHeaderProps) {
  const isMuted = tone === "muted";

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMuted ? 6 : 8,
        flex: 1,
        minWidth: 0,
        width: "100%",
        paddingRight: 4,
      }}
    >
      {startContent}
      {!isMuted ? (
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            flexShrink: 0,
            background: color,
          }}
        />
      ) : null}
      <span
        style={{
          fontSize: 13,
          lineHeight: "20px",
          fontWeight: isMuted ? 400 : 500,
          color: isMuted
            ? "var(--linear-color-ink-subtle)"
            : "var(--linear-color-ink)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {!isMuted ? (
        <span
          style={{
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      ) : null}
      {isMuted ? (
        <span
          aria-hidden
          style={{
            flex: 1,
            minWidth: 12,
            height: 1,
            marginInlineStart: 4,
            background: "var(--linear-color-hairline)",
          }}
        />
      ) : (
        <span style={{ flex: 1 }} />
      )}
      {endContent}
      {onAdd ? (
        <span
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <IconButton
            label={addLabel}
            variant="ghost"
            size="sm"
            icon={<Plus size={14} strokeWidth={2} />}
            onClick={onAdd}
          />
        </span>
      ) : null}
    </span>
  );
}
