"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { StaffRow } from "@/data/mocks/staff";

function RolePill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        paddingInline: 7,
        borderRadius: 999,
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 11,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function buildColumns(onSelectStaff: (row: StaffRow) => void): TableColumn<StaffRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStaff(row)}>
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
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStaff(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStaff(row)}>
          <span style={{ display: "inline-flex", gap: 6 }}>
            {row.isTrainer ? <RolePill label="Trainer" /> : null}
            {row.isAdmin ? <RolePill label="Admin" /> : null}
            {!row.isTrainer && !row.isAdmin ? (
              <span style={{ color: "var(--linear-color-ink-subtle)" }}>—</span>
            ) : null}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStaff(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.lastLoginAt}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type StaffTableProps = {
  data: StaffRow[];
  onSelectStaff: (row: StaffRow) => void;
};

export function StaffTable({ data, onSelectStaff }: StaffTableProps) {
  const columns = useMemo(() => buildColumns(onSelectStaff), [onSelectStaff]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable data={data} columns={columns} getRowKey={(row) => row.id} listChrome />
    </div>
  );
}
