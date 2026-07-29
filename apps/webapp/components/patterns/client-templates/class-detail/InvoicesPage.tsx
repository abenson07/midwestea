"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { InvoiceStatusToken, RowClickCell } from "@/components/patterns/client-templates/shared";
import {
  sampleClassInvoices,
  type ClassInvoiceRow,
} from "@/data/mocks/class-detail";

const GROUP_ORDER = ["Overdue", "Open", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Open: "#f2c94c",
  Paid: "#27a644",
};

function buildColumns(
  onSelectInvoice?: (row: ClassInvoiceRow) => void,
): TableColumn<ClassInvoiceRow>[] {
  return [
    {
      key: "studentName",
      header: "Student",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.studentName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "invoiceLabel",
      header: "Invoice",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.invoiceLabel}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.amount}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <InvoiceStatusToken invoice={row} />
        </RowClickCell>
      ),
    },
  ];
}

export type InvoicesPageProps = {
  onSelectInvoice?: (row: ClassInvoiceRow) => void;
};

/**
 * Full-width Invoices list — same list chrome as Foundation's own
 * grouped-table canvas, grouped by payment status.
 */
export function InvoicesPage({ onSelectInvoice }: InvoicesPageProps) {
  const columns = useMemo(
    () => buildColumns(onSelectInvoice),
    [onSelectInvoice],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleClassInvoices}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />
    </div>
  );
}
