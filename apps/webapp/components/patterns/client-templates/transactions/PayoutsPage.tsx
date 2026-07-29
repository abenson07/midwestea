"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";

function getPayoutDayKey(row: TransactionRow): string {
  return (row.paymentDate as string).slice(0, 10);
}

function formatPayoutDate(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildColumns(): TableColumn<TransactionRow>[] {
  return [
    {
      key: "student",
      header: "Student",
      width: proportional(1, { minWidth: 150 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.studentName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "class",
      header: "Class",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.classCode} · {row.className}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell>
          <TransactionTypeBadge transactionType={row.transactionType} />
        </RowClickCell>
      ),
    },
    {
      key: "invoice",
      header: "Invoice #",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.invoiceNumber ?? "—"}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell align="end">
          <span style={{ color: "var(--linear-color-ink)" }}>
            {formatCentsAsUSD(getTransactionAmountCents(row))}
          </span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Payouts grouped by the day money was paid out — one section/table per
 * day, mirroring /admin/reconcile's per-payout grouping but keyed on the
 * payment date since the mock data has no payout_id batching.
 */
export function PayoutsPage() {
  const columns = useMemo(() => buildColumns(), []);

  const paidRows = useMemo(
    () =>
      sampleTransactions
        .filter((row) => row.transactionStatus === "paid" && row.paymentDate)
        .sort((a, b) => (a.paymentDate! < b.paymentDate! ? 1 : -1)),
    [],
  );

  const dayTotals = useMemo(() => {
    const totals = new Map<string, { total: number; count: number }>();
    for (const row of paidRows) {
      const key = getPayoutDayKey(row);
      const entry = totals.get(key) ?? { total: 0, count: 0 };
      entry.total += getTransactionAmountCents(row);
      entry.count += 1;
      totals.set(key, entry);
    }
    return totals;
  }, [paidRows]);

  const groupOrder = useMemo(
    () => Array.from(dayTotals.keys()).sort((a, b) => (a < b ? 1 : -1)),
    [dayTotals],
  );

  return (
    <div
      data-slot="payouts-page"
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <NestedGroupedTable
        title="Payouts"
        data={paidRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={getPayoutDayKey}
        groupOrder={groupOrder}
        getGroupMeta={(key) => {
          const entry = dayTotals.get(key);
          return {
            label: `${formatCentsAsUSD(entry?.total ?? 0)} paid out on ${formatPayoutDate(key)}`,
          };
        }}
      />
    </div>
  );
}
