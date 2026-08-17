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
  /** Horizontal alignment for the header, body, and footer cells. @default "start" */
  align?: "start" | "end";
  renderCell: (row: T) => ReactNode;
  /** When set, this column is totaled in the table's sum footer. */
  sumValue?: (row: T) => number;
  /** Formats the footer total. Defaults to the raw number. */
  formatSum?: (total: number) => ReactNode;
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
