"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { OtherClassRow } from "@/data/mocks/classes";

function buildColumns(
  onSelect: (row: OtherClassRow) => void,
): TableColumn<OtherClassRow>[] {
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
      key: "totalEnrolled",
      header: "Total Enrolled",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.totalEnrolled}</span>
        </RowClickCell>
      ),
    },
    {
      key: "closedDate",
      header: "Closed",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.closedDate}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type OtherClassesListProps = {
  data: OtherClassRow[];
  onSelect: (row: OtherClassRow) => void;
};

/** Flat summary table of closed/other classes not shown in the active table. */
export function OtherClassesList({ data, onSelect }: OtherClassesListProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  return (
    <NestedGroupedTable
      title="All Other Classes"
      data={data}
      columns={columns}
      getRowKey={(row) => row.id}
    />
  );
}
