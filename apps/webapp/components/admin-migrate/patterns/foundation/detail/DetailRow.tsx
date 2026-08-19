"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/patterns/primitives/Text";

export type DetailRowProps = {
  label: string;
  /** Plain text value — ignored when `valueContent` is set. */
  value?: string;
  /** Arbitrary right-side content (badge, token, link) instead of plain text. */
  valueContent?: ReactNode;
};

/**
 * Static label ← → value fact row. Not interactive — use `DetailField` /
 * `DetailSelectField` for editable rows.
 */
export function DetailRow({ label, value, valueContent }: DetailRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingBlock: 7,
        minHeight: 20,
      }}
    >
      <Text size="sm" color="secondary">
        {label}
      </Text>
      {valueContent ?? (
        <Text
          weight="medium"
          style={{ textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {value ?? "—"}
        </Text>
      )}
    </div>
  );
}
