"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { VolunteerRow } from "./types";

const GROUP_ORDER = ["has-volunteered", "interested"];

const groupMeta: Record<string, { label: string; color: string }> = {
  "has-volunteered": { label: "Has volunteered before", color: "#27a644" },
  interested: { label: "Interested", color: "#f2c94c" },
};

function groupKey(row: VolunteerRow): string {
  return row.hasVolunteeredBefore ? "has-volunteered" : "interested";
}

function buildColumns(onSelect?: (row: VolunteerRow) => void): TableColumn<VolunteerRow>[] {
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
      key: "interestArea",
      header: "Interest Area",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.interestArea}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type VolunteersTableProps = {
  data?: VolunteerRow[];
  onSelect?: (row: VolunteerRow) => void;
};

/** Volunteers grouped by whether they've volunteered before or are just interested. */
export function VolunteersTable({ data = [], onSelect }: VolunteersTableProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={groupKey}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => groupMeta[key]}
        listChrome
      />
    </div>
  );
}
