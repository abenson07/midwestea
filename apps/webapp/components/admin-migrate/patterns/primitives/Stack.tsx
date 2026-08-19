"use client";

import type { CSSProperties, ReactNode } from "react";

export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";

export type StackProps = {
  children?: ReactNode;
  gap?: number;
  align?: StackAlign;
  justify?: StackJustify;
  /** Alias for `justify`, matching the source kit's HStack API. */
  hAlign?: StackJustify;
  style?: CSSProperties;
};

const alignMap: Record<StackAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const justifyMap: Record<StackJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

export function VStack({ children, gap = 0, align, justify, style }: StackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: gap * 4,
        alignItems: align ? alignMap[align] : undefined,
        justifyContent: justify ? justifyMap[justify] : undefined,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function HStack({ children, gap = 0, align, justify, hAlign, style }: StackProps) {
  const resolvedJustify = justify ?? hAlign;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: gap * 4,
        alignItems: align ? alignMap[align] : undefined,
        justifyContent: resolvedJustify ? justifyMap[resolvedJustify] : undefined,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
