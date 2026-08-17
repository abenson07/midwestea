"use client";

import type { ReactNode } from "react";

export type NavBottomProps = {
  start: ReactNode;
  end: ReactNode;
};

export function NavBottom({ start, end }: NavBottomProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 8,
        paddingInline: 4,
      }}
    >
      {start}
      {end}
    </div>
  );
}
