"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { OnlineClassStudentRow } from "@/data/mocks/online-class-detail";

/** Shared Name/Level/Email/Enrolled column set for the online-class student tables. */
export function buildStudentColumns(
  onSelectStudent?: (row: OnlineClassStudentRow) => void,
): TableColumn<OnlineClassStudentRow>[] {
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
      key: "level",
      header: "Level",
      width: pixel(72),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.level}</span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolledAt",
      header: "Enrolled",
      width: pixel(108),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.enrolledAt}</span>
        </RowClickCell>
      ),
    },
  ];
}
