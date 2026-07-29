"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import {
  sampleStudentClasses,
  type StudentClassRow,
} from "@/data/mocks/student-detail";

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
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.startDate}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "endDate",
      header: "Ends",
      width: pixel(108),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectClass?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.endDate}
          </span>
        </RowClickCell>
      ),
    },
  ];
}

export type ClassesPageProps = {
  onSelectClass?: (row: StudentClassRow) => void;
};

/**
 * Full-width Classes list — same list chrome as Foundation's own
 * grouped-table canvas, grouped by enrollment status.
 */
export function ClassesPage({ onSelectClass }: ClassesPageProps) {
  const columns = useMemo(
    () => buildColumns(onSelectClass),
    [onSelectClass],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleStudentClasses}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />
    </div>
  );
}
