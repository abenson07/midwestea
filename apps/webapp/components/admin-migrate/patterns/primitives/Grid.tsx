"use client";

import type { CSSProperties, ReactNode } from "react";

export type GridProps = {
  children?: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: number;
  style?: CSSProperties;
};

export function Grid({ children, columns = 1, gap = 0, style }: GridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: gap * 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
