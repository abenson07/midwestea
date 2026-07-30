"use client";

import { MoreHorizontal } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";
import type { MixedContentProperty } from "@/components/patterns/foundation/mixed-content";

export type { MixedContentProperty };

/**
 * Local re-render of the mixed-content header's property chip —
 * `MixedContentHeader`'s own chip isn't exported, so this mirrors its
 * look without reaching into Foundation internals.
 */
export function PropertyChip({ label, icon }: MixedContentProperty) {
  return (
    <button
      type="button"
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        paddingInline: 8,
        borderRadius: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      {icon ? (
        <span style={{ display: "inline-flex", color: "inherit" }}>{icon}</span>
      ) : null}
      {label}
    </button>
  );
}

export type PropertyChipRowProps = {
  properties: MixedContentProperty[];
  onMoreClick?: () => void;
};

/** "Properties" label + wrapped chip row, matching the mixed-content header. */
export function PropertyChipRow({
  properties,
  onMoreClick,
}: PropertyChipRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span
        style={{
          width: 72,
          flexShrink: 0,
          fontSize: 12,
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        Properties
      </span>
      {properties.map((property) => (
        <PropertyChip key={property.id} {...property} />
      ))}
      <IconButton
        label="More properties"
        variant="ghost"
        size="sm"
        icon={<MoreHorizontal size={14} strokeWidth={2} />}
        onClick={onMoreClick}
      />
    </div>
  );
}
