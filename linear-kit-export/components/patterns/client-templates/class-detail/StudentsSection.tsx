"use client";

import { useMemo } from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { pixel, proportional, type TableColumn } from "@astryxdesign/core/Table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import {
  sampleClassStudents,
  type ClassStudentRow,
} from "@/data/mocks/class-detail";

const GROUP_ORDER = ["Enrolled", "Waitlisted", "Withdrawn"];

const groupColors: Record<string, string> = {
  Enrolled: "#27a644",
  Waitlisted: "#f2c94c",
  Withdrawn: "#8a8f98",
};

function buildColumns(
  onSelectStudent?: (row: ClassStudentRow) => void,
): TableColumn<ClassStudentRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      width: pixel(72),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.grade}</span>
        </RowClickCell>
      ),
    },
    {
      key: "guardian",
      header: "Guardian",
      width: pixel(160),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.guardian}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolledAt",
      header: "Enrolled",
      width: pixel(88),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.enrolledAt}
          </span>
        </RowClickCell>
      ),
    },
  ];
}

export type StudentsSectionProps = {
  onSelectStudent?: (row: ClassStudentRow) => void;
};

/**
 * Enrollment section — students grouped by enrollment status.
 * Inline overview section; see `StudentsPage` for the full-width view.
 */
export function StudentsSection({ onSelectStudent }: StudentsSectionProps) {
  const columns = useMemo(
    () => buildColumns(onSelectStudent),
    [onSelectStudent],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <NestedGroupedTable
      title="Students"
      data={sampleClassStudents}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={(row) => row.status}
      groupOrder={groupOrder}
      getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
    />
  );
}
