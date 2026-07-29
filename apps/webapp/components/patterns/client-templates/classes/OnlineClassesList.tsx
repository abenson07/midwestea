"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { Switch } from "@/components/patterns/primitives/Switch";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { OnlineClassRow } from "@/data/mocks/classes";

function buildColumns(
  onSelect: (row: OnlineClassRow) => void,
  onToggle: (row: OnlineClassRow, next: boolean) => void,
): TableColumn<OnlineClassRow>[] {
  return [
    {
      key: "name",
      header: "Class",
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)", marginInlineEnd: 8 }}>
            {row.code}
          </span>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolledCount",
      header: "Actively Enrolled",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.enrolledCount}</span>
        </RowClickCell>
      ),
    },
    {
      key: "price",
      header: "Price",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.price}</span>
        </RowClickCell>
      ),
    },
    {
      key: "isEnabled",
      header: "Enabled",
      width: pixel(72),
      renderCell: (row) => (
        <Switch
          label={`Enable ${row.code}`}
          isLabelHidden
          value={row.isEnabled}
          onChange={(next) => onToggle(row, next)}
        />
      ),
    },
  ];
}

export type OnlineClassesListProps = {
  data: OnlineClassRow[];
  onToggle: (row: OnlineClassRow, next: boolean) => void;
  onSelect: (row: OnlineClassRow) => void;
};

/** Online classes/courses table — toggle on/off, plus a quick-look row click. */
export function OnlineClassesList({ data, onToggle, onSelect }: OnlineClassesListProps) {
  const columns = useMemo(() => buildColumns(onSelect, onToggle), [onSelect, onToggle]);

  return (
    <NestedGroupedTable
      title="Online Classes"
      data={data}
      columns={columns}
      getRowKey={(row) => row.id}
    />
  );
}
