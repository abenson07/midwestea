"use client";

import type { ReactNode } from "react";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";

export function TransactionSidePanel({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        flexShrink: 0,
        alignSelf: "stretch",
        boxSizing: "border-box",
        padding: "8px 8px 8px 0",
      }}
    >
      <OutlinedPanel onClose={onClose}>{children}</OutlinedPanel>
    </div>
  );
}
