"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import type { TransactionRow } from "@/data/mocks/transactions";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
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

export type CoursesPageLiveProps = {
  data: TransactionRow[];
};

/** One grouped table section per course, spanning transactions across all of that course's classes. */
export function CoursesPageLive({ data }: CoursesPageLiveProps) {
  const columns = useMemo(() => buildColumns(), []);
  const groupOrder = useMemo(() => Array.from(new Set(data.map((row) => row.courseCode))).sort(), [data]);

  return (
    <ClassContentPage>
      <NestedGroupedTable
        title="Courses"
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.courseCode}
        groupOrder={groupOrder}
        getGroupMeta={(key) => {
          const row = data.find((item) => item.courseCode === key);
          return { label: row ? `${row.courseCode} · ${row.courseName}` : key };
        }}
      />
    </ClassContentPage>
  );
}
