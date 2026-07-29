"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
  getTransactionDisplayStatus,
} from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";
import { ReminderButton } from "./ReminderButton";

const pastDueRows: TransactionRow[] = sampleTransactions.filter(
  (row) => getTransactionDisplayStatus(row) === "past_due",
);

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
    {
      key: "reminder",
      header: "",
      width: pixel(140),
      renderCell: () => <ReminderButton />,
    },
  ];
}

/** Full flat list of every past-due invoice, not just the top rows shown on Overview. */
export function PastDuePage() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ClassContentPage>
      <NestedGroupedTable
        title="Past Due"
        data={pastDueRows}
        columns={columns}
        getRowKey={(row) => row.id}
      />
    </ClassContentPage>
  );
}
