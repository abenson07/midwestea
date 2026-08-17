"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { MemberRow } from "./types";

const GROUP_ORDER = ["household", "individual", "senior", "student", "no-tier"];

const groupMeta: Record<string, { label: string; color: string }> = {
  household: { label: "Household", color: "#27a644" },
  individual: { label: "Individual", color: "#5e6ad2" },
  senior: { label: "Senior", color: "#f2994a" },
  student: { label: "Student", color: "#f2c94c" },
  "no-tier": { label: "No tier", color: "#8a8f98" },
};

function buildColumns(onSelect?: (row: MemberRow) => void): TableColumn<MemberRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
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
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "memberSince",
      header: "Member Since",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.memberSince}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type MembersTableProps = {
  data?: MemberRow[];
  onSelect?: (row: MemberRow) => void;
};

/** Members roster grouped by membership type. */
export function MembersTable({ data = [], onSelect }: MembersTableProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.membershipType}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => groupMeta[key]}
        listChrome
      />
    </div>
  );
}
