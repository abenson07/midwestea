"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
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

export type ClassesPageLiveProps = {
  data: StudentClassRow[];
  onSelectClass?: (row: StudentClassRow) => void;
};

/** Full-width real per-student Classes list. */
export function ClassesPageLive({ data, onSelectClass }: ClassesPageLiveProps) {
  const columns = useMemo(() => buildColumns(onSelectClass), [onSelectClass]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />
    </div>
  );
}
