"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { ShirtPreorderItemRow } from "@/hooks/useShirtPreorderItems";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
};

function buildColumns(): TableColumn<ShirtPreorderItemRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {row.people?.full_name?.trim() || "Unknown"}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.people?.email?.trim() || "—"}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "size",
      header: "Size",
      width: pixel(90),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.variant}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "orderedAt",
      header: "Ordered",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{formatDate(row.created_at)}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type OrdersTableProps = {
  data?: ShirtPreorderItemRow[];
};

/** One row per shirt ordered — flat, ungrouped. */
export function OrdersTable({ data = [] }: OrdersTableProps) {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable data={data} columns={columns} getRowKey={(row) => row.id} listChrome />
    </div>
  );
}
