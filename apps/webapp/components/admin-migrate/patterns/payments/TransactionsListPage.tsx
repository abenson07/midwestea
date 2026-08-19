"use client";

import { useMemo } from "react";
import { ClassContentPage } from "@/components/admin-migrate/patterns/client-templates/shared";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import {
  matchesTransactionStatusFilter,
  type TransactionStatusFilter,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";
import { buildTransactionColumns } from "./transactionColumns";

export type TransactionsListPageProps = {
  rows: TransactionRow[];
  search: string;
  statusFilter: string[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  /** When set, ignore the status chips and force this filter (Past Due tab). */
  forcedStatus?: TransactionStatusFilter;
};

function matchesSearch(row: TransactionRow, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    (row.invoiceNumber ?? "").toLowerCase().includes(q) ||
    row.studentName.toLowerCase().includes(q) ||
    (row.studentEmail ?? "").toLowerCase().includes(q) ||
    row.classCode.toLowerCase().includes(q) ||
    row.className.toLowerCase().includes(q)
  );
}

export function TransactionsListPage({
  rows,
  search,
  statusFilter,
  selectedId,
  onSelect,
  forcedStatus,
}: TransactionsListPageProps) {
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesSearch(row, search)) return false;
      if (forcedStatus) return matchesTransactionStatusFilter(row, forcedStatus);
      if (!statusFilter.length) return true;
      return statusFilter.some((value) => matchesTransactionStatusFilter(row, value));
    });
  }, [rows, search, statusFilter, forcedStatus]);

  const columns = useMemo(
    () => buildTransactionColumns({ selectedId, onSelect }),
    [selectedId, onSelect],
  );

  if (!filtered.length) {
    return (
      <ClassContentPage>
        <Text color="secondary">No transactions match the current filters.</Text>
      </ClassContentPage>
    );
  }

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        isRowSelected={(row) => row.id === selectedId}
        listChrome
      />
    </div>
  );
}
