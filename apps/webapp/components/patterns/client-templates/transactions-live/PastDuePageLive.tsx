"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import type { TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents, getTransactionDisplayStatus } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge, TransactionStatusToken, ReminderButton } from "@/components/patterns/client-templates/transactions";

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

export type PastDuePageLiveProps = {
  data: TransactionRow[];
};

/** Full flat list of every past-due invoice, real data. */
export function PastDuePageLive({ data }: PastDuePageLiveProps) {
  const columns = useMemo(() => buildColumns(), []);
  const rows = useMemo(
    () => data.filter((row) => getTransactionDisplayStatus(row) === "past_due"),
    [data],
  );

  return (
    <ClassContentPage>
      <NestedGroupedTable title="Past Due" data={rows} columns={columns} getRowKey={(row) => row.id} />
    </ClassContentPage>
  );
}
