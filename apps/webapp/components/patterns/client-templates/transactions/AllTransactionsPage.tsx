"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
  getTransactionDisplayStatus,
  TRANSACTION_DISPLAY_STATUS_LABEL,
} from "@/data/mocks/transaction-status";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusToken } from "./TransactionStatusToken";

const PAGE_SIZE = 50;

const GROUP_ORDER = ["past_due", "due_soon", "pending", "paid", "refunded", "cancelled"];

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
 * All transactions grouped by status. Data is a single static array — the
 * "load 50, then reveal more on scroll" behavior is simulated client-side
 * via IntersectionObserver rather than real pagination.
 */
export function AllTransactionsPage() {
  const columns = useMemo(() => buildColumns(), []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sampleTransactions.length));
        }
      },
      { root, rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const visibleRows = sampleTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < sampleTransactions.length;

  return (
    <div
      ref={scrollContainerRef}
      data-slot="class-content-page"
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
        title="All Transactions"
        data={visibleRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => getTransactionDisplayStatus(row)}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => ({
          label: TRANSACTION_DISPLAY_STATUS_LABEL[key as keyof typeof TRANSACTION_DISPLAY_STATUS_LABEL],
        })}
      />
      {hasMore ? <div ref={sentinelRef} style={{ height: 1 }} /> : null}
    </div>
  );
}
