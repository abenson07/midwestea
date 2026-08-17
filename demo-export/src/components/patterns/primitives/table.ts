import type { ReactNode } from "react";

export type TableColumnWidth =
  | { kind: "pixel"; px: number }
  | { kind: "proportional"; grow: number; minWidth?: number };

export function pixel(px: number): TableColumnWidth {
  return { kind: "pixel", px };
}

export function proportional(
  grow: number,
  opts?: { minWidth?: number },
): TableColumnWidth {
  return { kind: "proportional", grow, minWidth: opts?.minWidth };
}

export type TableColumn<T> = {
  key: string;
  header: string;
  width: TableColumnWidth;
  renderCell: (row: T) => ReactNode;
};

export function columnsToGridTemplate<T>(columns: TableColumn<T>[]): string {
  return columns
    .map((column) =>
      column.width.kind === "pixel"
        ? `${column.width.px}px`
        : `minmax(${column.width.minWidth ?? 0}px, ${column.width.grow}fr)`,
    )
    .join(" ");
}
