"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";

const groupOrder = Array.from(new Set(sampleTransactions.map((row) => row.courseCode))).sort();

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
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.classCode}</span>
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

/** One grouped table section per course, spanning transactions across all of that course's classes. */
export function CoursesPage() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ClassContentPage>
      <NestedGroupedTable
        title="Courses"
        data={sampleTransactions}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.courseCode}
        groupOrder={groupOrder}
        getGroupMeta={(key) => {
          const row = sampleTransactions.find((item) => item.courseCode === key);
          return { label: row ? `${row.courseCode} · ${row.courseName}` : key };
        }}
      />
    </ClassContentPage>
  );
}
