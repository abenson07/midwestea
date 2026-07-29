"use client";

import { useMemo, useState } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
  getTransactionDisplayStatus,
} from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";
import { ReminderButton } from "./ReminderButton";
import {
  TransactionFilterPopover,
  type TransactionFilterValue,
} from "./TransactionFilterPopover";

const GROUP_ORDER = ["past_due", "due_soon"];

const groupMeta: Record<string, { label: string; color: string }> = {
  past_due: { label: "Past Due", color: "#eb5757" },
  due_soon: { label: "Due Soon", color: "#f2994a" },
};

export const dueSoonAndPastDueRows: TransactionRow[] = sampleTransactions.filter((row) => {
  const status = getTransactionDisplayStatus(row);
  return status === "past_due" || status === "due_soon";
});

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

export type PastDueDueSoonTableProps = {
  classOptions: { code: string; label: string }[];
};

export function PastDueDueSoonTable({ classOptions }: PastDueDueSoonTableProps) {
  const columns = useMemo(() => buildColumns(), []);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<TransactionFilterValue>({
    classCode: "all",
    status: "all",
  });

  const filteredRows = useMemo(() => {
    return dueSoonAndPastDueRows.filter((row) => {
      if (filter.classCode !== "all" && row.classCode !== filter.classCode) return false;
      if (filter.status !== "all" && getTransactionDisplayStatus(row) !== filter.status) {
        return false;
      }
      return true;
    });
  }, [filter]);

  return (
    <div style={{ position: "relative" }}>
      <NestedGroupedTable
        title="Past Due & Due Soon"
        data={filteredRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => getTransactionDisplayStatus(row)}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => groupMeta[key]}
        onFilterClick={() => setFilterOpen((open) => !open)}
      />
      {filterOpen ? (
        <div style={{ position: "absolute", top: 32, right: 4, zIndex: 50 }}>
          <TransactionFilterPopover
            classes={classOptions}
            value={filter}
            onChange={setFilter}
            onClose={() => setFilterOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
