"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Switch } from "@/components/admin-migrate/patterns/primitives/Switch";

export type DetailToggleRowProps = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  /** Optional trailing status badge/token next to the switch. */
  badge?: ReactNode;
};

/** Boolean setting row — label left, `Switch` (+ optional status badge) right. */
export function DetailToggleRow({ label, value, onChange, badge }: DetailToggleRowProps) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch label={label} isLabelHidden value={value} onChange={onChange} />
        {badge}
      </div>
    </div>
  );
}
