"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { PersonOrderRow } from "@/hooks/useShirtPreorderItems";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function buildColumns(): TableColumn<PersonOrderRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.fullName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.phone}</span>
        </RowClickCell>
      ),
    },
    {
      key: "sizes",
      header: "Sizes",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.sizesSummary}</span>
        </RowClickCell>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      width: pixel(70),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.quantity}</span>
        </RowClickCell>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.paymentStatus}</span>
        </RowClickCell>
      ),
    },
    {
      key: "latestAt",
      header: "Latest order",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{formatDate(row.latestAt)}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type PeopleTableProps = {
  data?: PersonOrderRow[];
};

/** One row per purchaser, sizes/quantity aggregated — flat, ungrouped. */
export function PeopleTable({ data = [] }: PeopleTableProps) {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable data={data} columns={columns} getRowKey={(row) => row.personId} listChrome />
    </div>
  );
}
