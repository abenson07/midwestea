"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { NeighborRow } from "./types";

function buildColumns(onSelect?: (row: NeighborRow) => void): TableColumn<NeighborRow>[] {
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
      key: "address",
      header: "Address",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.address}</span>
        </RowClickCell>
      ),
    },
    {
      key: "joinedDate",
      header: "Joined",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.joinedDate}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type NeighborsTableProps = {
  data?: NeighborRow[];
  onSelect?: (row: NeighborRow) => void;
};

/** Full org-wide neighbor roster — flat, ungrouped. */
export function NeighborsTable({ data = [], onSelect }: NeighborsTableProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome
      />
    </div>
  );
}
