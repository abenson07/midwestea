"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { BudgetChart } from "@/components/patterns/client-templates/events/BudgetChart";
import { SponsorshipLevelsPanel } from "./SponsorshipLevelsPanel";
import {
  sampleLeafletBudgetSummary,
  sampleLeafletSponsorshipInvoices,
  type LeafletBudgetSummary,
  type LeafletSponsorshipInvoiceRow,
} from "@/data/mocks/leaflets";

const GROUP_ORDER = ["Overdue", "Pending", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Pending: "#f2c94c",
  Paid: "#27a644",
};

function buildColumns(
  onSelectInvoice?: (row: LeafletSponsorshipInvoiceRow) => void,
): TableColumn<LeafletSponsorshipInvoiceRow>[] {
  return [
    {
      key: "business",
      header: "Business",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.business}</span>
        </RowClickCell>
      ),
    },
    {
      key: "invoiceNumber",
      header: "Invoice #",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceNumber}</span>
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
      key: "dueDate",
      header: "Due",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.dueDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "level",
      header: "Level",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.level}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type LeafletSponsorshipsPageProps = {
  onSelectInvoice?: (row: LeafletSponsorshipInvoiceRow) => void;
  invoices?: LeafletSponsorshipInvoiceRow[];
  budgetSummary?: LeafletBudgetSummary;
  leafletId?: string | null;
};

/**
 * Sponsorships tab — combines what used to be separate Sponsorships and
 * Invoices views into one, same shape as Events' `BudgetPage`: a five-column
 * summary row (chart + levels), then invoices grouped by payment status.
 */
export function LeafletSponsorshipsPage({
  onSelectInvoice,
  invoices: invoicesProp,
  budgetSummary,
  leafletId,
}: LeafletSponsorshipsPageProps) {
  const columns = useMemo(() => buildColumns(onSelectInvoice), [onSelectInvoice]);
  const groupOrder = useMemo(() => GROUP_ORDER, []);
  const invoices = invoicesProp ?? sampleLeafletSponsorshipInvoices;

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div style={{ gridColumn: "span 4" }}>
          <BudgetChart summary={budgetSummary ?? sampleLeafletBudgetSummary} />
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <SponsorshipLevelsPanel leafletId={leafletId} />
        </div>
      </div>
      <NestedGroupedTable
        title="Sponsorship invoices"
        data={invoices}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
      />
    </ClassContentPage>
  );
}
