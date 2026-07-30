"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import type { TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents, getTransactionDisplayStatus } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge, TransactionStatusToken } from "@/components/patterns/client-templates/transactions";

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
      key: "amount",
      header: "Amount",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {formatCentsAsUSD(getTransactionAmountCents(row))}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell>
          <TransactionStatusToken transaction={row} />
        </RowClickCell>
      ),
    },
  ];
}

export type RecentActivityTableLiveProps = {
  data: TransactionRow[];
};

/**
 * Recently created transactions not already surfaced in Past Due & Due Soon
 * (paid, cancelled, refunded, or pending further out than the 7-day window).
 */
export function RecentActivityTableLive({ data }: RecentActivityTableLiveProps) {
  const columns = useMemo(() => buildColumns(), []);

  const rows = useMemo(() => {
    const dueSoonAndPastDueIds = new Set(
      data
        .filter((row) => {
          const status = getTransactionDisplayStatus(row);
          return status === "past_due" || status === "due_soon";
        })
        .map((row) => row.id),
    );
    return data
      .filter((row) => !dueSoonAndPastDueIds.has(row.id))
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 25);
  }, [data]);

  return (
    <NestedGroupedTable title="Recent Activity" data={rows} columns={columns} getRowKey={(row) => row.id} />
  );
}
