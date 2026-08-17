"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { SettingsInsetList } from "@/components/patterns/client-templates-migrate/settings/SettingsInsetList";
import {
  formatCentsAsUSD,
  formatShortDate,
} from "@/data/mocks/transaction-status";
import {
  getPayoutInvoiceRows,
  setPayoutReconciled,
  type PayoutInvoiceRow,
} from "@/data/mocks/payouts";

type PayoutListRow = PayoutInvoiceRow & { groupLabel: string };

function payoutDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function withGroupLabels(rows: PayoutInvoiceRow[]): PayoutListRow[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.payoutId, (totals.get(row.payoutId) ?? 0) + row.amountCents);
  }
  return rows.map((row) => ({
    ...row,
    groupLabel: `${formatCentsAsUSD(totals.get(row.payoutId) ?? 0)} paid out on ${payoutDateLabel(row.payoutDate)}`,
  }));
}

export function PayoutsPage() {
  const [rows, setRows] = useState<PayoutInvoiceRow[]>(() => getPayoutInvoiceRows());
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const labeled = useMemo(() => withGroupLabels(rows), [rows]);
  const filtered = useMemo(() => {
    if (!search) return labeled;
    const q = search.toLowerCase();
    return labeled.filter(
      (row) =>
        row.studentEmail.toLowerCase().includes(q) ||
        (row.invoiceNumber ?? "").toLowerCase().includes(q),
    );
  }, [labeled, search]);

  function reconcile(id: string) {
    setPayoutReconciled(id, true);
    setRows(getPayoutInvoiceRows());
    toast.success("Reconciled — demo mode, saved locally only");
  }

  function undo(id: string) {
    setPayoutReconciled(id, false);
    setRows(getPayoutInvoiceRows());
    toast.success("Reconciliation undone — demo mode, saved locally only");
  }

  const columns: TableColumn<PayoutListRow>[] = [
    {
      key: "email",
      header: "Customer email",
      width: proportional(1.2, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.studentEmail}</span>
      ),
    },
    {
      key: "amount",
      header: "Payment amount",
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{formatCentsAsUSD(row.amountCents)}</span>
      ),
    },
    {
      key: "paymentDate",
      header: "Payment date",
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {formatShortDate(row.paymentDate)}
        </span>
      ),
    },
    {
      key: "invoice",
      header: "Invoice number",
      width: proportional(0.7, { minWidth: 100 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {row.invoiceNumber ?? "N/A"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: proportional(0.7, { minWidth: 110 }),
      renderCell: (row) =>
        row.reconciled ? (
          <span
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {hoveredId === row.id ? (
              <Button label="Undo" variant="ghost" size="sm" onClick={() => undo(row.id)} />
            ) : (
              <Badge label="Reconciled" />
            )}
          </span>
        ) : (
          <Button label="Reconcile" variant="ghost" size="sm" onClick={() => reconcile(row.id)} />
        ),
    },
  ];

  return (
    <SettingsInsetList
      title="Payouts"
      description="Transactions with payout IDs"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search invoices…"
      isEmpty={filtered.length === 0}
      emptyLabel="No transactions with payout IDs found."
    >
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.groupLabel}
        listChrome={false}
      />
    </SettingsInsetList>
  );
}
