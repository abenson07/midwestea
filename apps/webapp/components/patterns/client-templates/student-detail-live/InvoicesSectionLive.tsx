"use client";

import { useMemo } from "react";
import { CreditCard } from "lucide-react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { EmptyStateCard, RowClickCell } from "@/components/patterns/client-templates/shared";
import { StudentInvoiceStatusToken } from "@/components/patterns/client-templates/student-detail";
import type { StudentInvoiceRow } from "@/data/mocks/student-detail";

const GROUP_ORDER = ["Overdue", "Open", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Open: "#f2c94c",
  Paid: "#27a644",
};

function buildColumns(
  onSelectInvoice?: (row: StudentInvoiceRow) => void,
): TableColumn<StudentInvoiceRow>[] {
  return [
    {
      key: "className",
      header: "Class",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.className}</span>
        </RowClickCell>
      ),
    },
    {
      key: "invoiceLabel",
      header: "Invoice",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceLabel}</span>
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
          <StudentInvoiceStatusToken invoice={row} />
        </RowClickCell>
      ),
    },
  ];
}

export type InvoicesSectionLiveProps = {
  data: StudentInvoiceRow[];
  onSelectInvoice?: (row: StudentInvoiceRow) => void;
  onGoToPayments?: () => void;
};

/** Real per-student payments, grouped by status. Inline overview section. */
export function InvoicesSectionLive({ data, onSelectInvoice, onGoToPayments }: InvoicesSectionLiveProps) {
  const columns = useMemo(() => buildColumns(onSelectInvoice), [onSelectInvoice]);

  if (data.length === 0) {
    return (
      <section data-slot="invoices-section" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <EmptyStateCard
          label="No current classes"
          icon={<CreditCard size={14} strokeWidth={1.75} />}
          onClick={onGoToPayments}
        />
      </section>
    );
  }

  return (
    <NestedGroupedTable
      title="Payments"
      data={data}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={(row) => row.status}
      groupOrder={GROUP_ORDER}
      getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
    />
  );
}
