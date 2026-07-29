"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";

const activeClassRows: TransactionRow[] = sampleTransactions.filter((row) => row.isActiveClass);

const groupOrder = Array.from(new Set(activeClassRows.map((row) => row.classCode))).sort();

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

/** One grouped table section per open/enrolling class, each showing that class's transactions. */
export function ActiveClassesPage() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ClassContentPage>
      <NestedGroupedTable
        title="Active Classes"
        data={activeClassRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.classCode}
        groupOrder={groupOrder}
        getGroupMeta={(key) => {
          const row = activeClassRows.find((item) => item.classCode === key);
          return { label: row ? `${row.classCode} · ${row.className}` : key };
        }}
      />
    </ClassContentPage>
  );
}
