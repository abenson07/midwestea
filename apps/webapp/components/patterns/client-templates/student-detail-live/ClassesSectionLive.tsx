"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { StudentClassRow } from "@/data/mocks/student-detail";

const GROUP_ORDER = ["Enrolled", "Waitlisted", "Completed", "Withdrawn"];

const groupColors: Record<string, string> = {
  Enrolled: "#27a644",
  Waitlisted: "#f2c94c",
  Completed: "#5e6ad2",
  Withdrawn: "#8a8f98",
};

function buildColumns(
  onSelectClass?: (row: StudentClassRow) => void,
): TableColumn<StudentClassRow>[] {
  return [
    {
      key: "className",
      header: "Class",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectClass?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.className}</span>
        </RowClickCell>
      ),
    },
    {
      key: "program",
      header: "Program",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectClass?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.program}</span>
        </RowClickCell>
      ),
    },
    {
      key: "startDate",
      header: "Starts",
      width: pixel(108),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectClass?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.startDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "endDate",
      header: "Ends",
      width: pixel(108),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectClass?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.endDate}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type ClassesSectionLiveProps = {
  data: StudentClassRow[];
  onSelectClass?: (row: StudentClassRow) => void;
};

/** Real per-student classes, grouped by status. Inline overview section. */
export function ClassesSectionLive({ data, onSelectClass }: ClassesSectionLiveProps) {
  const columns = useMemo(() => buildColumns(onSelectClass), [onSelectClass]);

  return (
    <NestedGroupedTable
      title="Classes"
      data={data}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={(row) => row.status}
      groupOrder={GROUP_ORDER}
      getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
    />
  );
}
