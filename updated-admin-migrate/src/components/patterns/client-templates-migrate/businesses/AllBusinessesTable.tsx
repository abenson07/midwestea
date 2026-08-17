"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { BusinessRow } from "./types";

function buildColumns(onSelect?: (row: BusinessRow) => void): TableColumn<BusinessRow>[] {
  return [
    {
      key: "businessName",
      header: "Business",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.businessName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: pixel(160),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.category}</span>
        </RowClickCell>
      ),
    },
    {
      key: "contactName",
      header: "Contact",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.contactName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.phone}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type AllBusinessesTableProps = {
  data?: BusinessRow[];
  onSelect?: (row: BusinessRow) => void;
};

/** Full directory of all businesses — flat, ungrouped. */
export function AllBusinessesTable({ data = [], onSelect }: AllBusinessesTableProps) {
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
