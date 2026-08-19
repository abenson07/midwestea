"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Badge } from "@/components/patterns/primitives/Badge";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { roleLabel, type StaffRow } from "./types";

function buildColumns(
  selectedId: string | null,
  onSelect: (id: string) => void,
): TableColumn<StaffRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1.4, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--linear-color-ink)",
                fontWeight: row.id === selectedId ? 600 : 500,
                lineHeight: "18px",
              }}
            >
              {row.name}
            </span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--linear-color-ink-subtle)",
                fontSize: 12,
                lineHeight: "16px",
              }}
            >
              {row.email}
            </span>
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: proportional(0.6, { minWidth: 100 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <Badge label="Active" />
        </RowClickCell>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: proportional(0.6, { minWidth: 100 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{roleLabel(row)}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type StaffTableProps = {
  data?: StaffRow[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function StaffTable({ data = [], selectedId = null, onSelect }: StaffTableProps) {
  const columns = useMemo(
    () => buildColumns(selectedId, onSelect ?? (() => undefined)),
    [selectedId, onSelect],
  );

  return (
    <GroupedTable
      data={data}
      columns={columns}
      getRowKey={(row) => row.id}
      isRowSelected={(row) => row.id === selectedId}
      groupBy={() => "Active"}
      listChrome={false}
    />
  );
}
