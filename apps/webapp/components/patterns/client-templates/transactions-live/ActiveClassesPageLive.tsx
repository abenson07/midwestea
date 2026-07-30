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

export type ActiveClassesPageLiveProps = {
  data: TransactionRow[];
};

/** One grouped table section per open/enrolling program class — excludes online classes. */
export function ActiveClassesPageLive({ data }: ActiveClassesPageLiveProps) {
  const columns = useMemo(() => buildColumns(), []);
  const activeClassRows = useMemo(() => data.filter((row) => row.isActiveClass), [data]);
  const groupOrder = useMemo(
    () => Array.from(new Set(activeClassRows.map((row) => row.classCode))).sort(),
    [activeClassRows],
  );

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
