"use client";

import type { CSSProperties, ReactNode } from "react";

export type RowClickCellProps = {
  onClick?: () => void;
  align?: "start" | "end";
  children: ReactNode;
};

/**
 * Fills a table cell with a click target so the whole row responds to a
 * click, not just one column — matches the row-wide hover highlight from
 * `listChrome`/`appearance="nested"`.
 */
export function RowClickCell({ onClick, align = "start", children }: RowClickCellProps) {
  const style: CSSProperties = {
    all: "unset",
    boxSizing: "border-box",
    cursor: onClick ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "end" ? "flex-end" : "flex-start",
    width: "100%",
    height: "100%",
    minWidth: 0,
  };

  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}
