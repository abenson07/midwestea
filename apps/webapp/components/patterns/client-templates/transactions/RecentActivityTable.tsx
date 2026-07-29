"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";
import { dueSoonAndPastDueRows } from "./PastDueDueSoonTable";

const dueSoonAndPastDueIds = new Set(dueSoonAndPastDueRows.map((row) => row.id));

const recentActivityRows: TransactionRow[] = sampleTransactions
  .filter((row) => !dueSoonAndPastDueIds.has(row.id))
  .slice()
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  .slice(0, 25);

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

/**
 * Recently created payments/invoices that aren't already surfaced in the
 * Past Due & Due Soon table above (paid, cancelled, refunded, or pending
 * with a due date further out than the 7-day due-soon window).
 */
export function RecentActivityTable() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <NestedGroupedTable
      title="Recent Activity"
      data={recentActivityRows}
      columns={columns}
      getRowKey={(row) => row.id}
    />
  );
}
