"use client";

import type { ReactNode } from "react";

export type DetailActionBarProps = {
  children: ReactNode;
};

/** Wrapping row of action `Button`s under a detail panel header. */
export function DetailActionBar({ children }: DetailActionBarProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
  );
}
