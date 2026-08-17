"use client";

import { useMemo } from "react";
import { useStripeInvoices } from "hooks";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";
import {
  customerLabelFromEmail,
  formatDueDate,
  formatUsd,
  isOpenPastDue,
  mercuryInvoiceDisplayStatus,
  mercuryInvoiceStatusColor,
} from "@/components/billing/invoiceUtils";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";

const STATUS_HEX: Record<"warning" | "info" | "success", string> = {
  warning: "#eb5757",
  info: "#f2c94c",
  success: "#27a644",
};

function StatusPill({ invoice }: { invoice: StripeInvoiceTableRow }) {
  const displayStatus = mercuryInvoiceDisplayStatus(invoice);
  const color = STATUS_HEX[mercuryInvoiceStatusColor(displayStatus)];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {displayStatus}
    </span>
  );
}

function matchesStatusFilter(invoice: StripeInvoiceTableRow, filter: string[]): boolean {
  if (filter.length === 0) return true;
  return filter.some((value) => {
    if (value === "paid") return invoice.status === "paid";
    if (value === "unpaid") return invoice.status === "open";
    if (value === "past_due") return isOpenPastDue(invoice);
    return false;
  });
}

function matchesCategoryFilter(invoice: StripeInvoiceTableRow, filter: string[]): boolean {
  if (filter.length === 0) return true;
  const category = (invoice.sponsorship_category ?? "").toLowerCase();
  return filter.some((value) => category.includes(value));
}

function matchesSearch(invoice: StripeInvoiceTableRow, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    (invoice.number ?? "").toLowerCase().includes(q) ||
    (invoice.customer_email ?? "").toLowerCase().includes(q) ||
    customerLabelFromEmail(invoice.customer_email).toLowerCase().includes(q)
  );
}

export function buildInvoiceColumns(
  onSelect?: (row: StripeInvoiceTableRow) => void,
  options?: { even?: boolean },
): TableColumn<StripeInvoiceTableRow>[] {
  const even = options?.even === true;
  return [
    {
      key: "customer",
      header: "Customer",
      width: even ? proportional(1.4, { minWidth: 140 }) : proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {customerLabelFromEmail(row.customer_email)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "number",
      header: "Invoice #",
      width: even ? proportional(1, { minWidth: 100 }) : pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.number ?? "—"}</span>
        </RowClickCell>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: even ? proportional(1.2, { minWidth: 110 }) : pixel(160),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.sponsorship_category ?? "—"}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: even ? proportional(0.9, { minWidth: 90 }) : pixel(100),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)" }}>{formatUsd(row.amount_due)}</span>
        </RowClickCell>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      width: even ? proportional(1, { minWidth: 100 }) : pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {formatDueDate(row.due_date)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: even ? proportional(1, { minWidth: 100 }) : pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={onSelect ? () => onSelect(row) : undefined}>
          <StatusPill invoice={row} />
        </RowClickCell>
      ),
    },
  ];
}

export type InvoicingInvoicesPageProps = {
  search: string;
  statusFilter: string[];
  categoryFilter: string[];
  onSelectInvoice?: (row: StripeInvoiceTableRow) => void;
};

export function InvoicingInvoicesPage({
  search,
  statusFilter,
  categoryFilter,
  onSelectInvoice,
}: InvoicingInvoicesPageProps) {
  const { invoices, loading, error } = useStripeInvoices();
  const columns = useMemo(() => buildInvoiceColumns(onSelectInvoice), [onSelectInvoice]);

  const filtered = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          matchesStatusFilter(invoice, statusFilter) &&
          matchesCategoryFilter(invoice, categoryFilter) &&
          matchesSearch(invoice, search),
      ),
    [invoices, statusFilter, categoryFilter, search],
  );

  if (error) {
    return (
      <ClassContentPage>
        <Text color="secondary">{error}</Text>
      </ClassContentPage>
    );
  }

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome
      />
      {!loading && filtered.length === 0 ? (
        <div style={{ padding: 24 }}>
          <Text color="secondary">No invoices match the current filters.</Text>
        </div>
      ) : null}
    </div>
  );
}
