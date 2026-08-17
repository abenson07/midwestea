"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Text } from "@/components/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import type { ClassDetail } from "./classMocks";
import { useTransactions } from "../payments/useTransactions";
import {
  buildPastDueTransactionColumns,
  buildTransactionColumns,
  TRANSACTION_STATUS_FILTER_OPTIONS,
  TRANSACTION_TYPE_FILTER_OPTIONS,
} from "../payments/transactionColumns";
import { getTransactionListStatus, matchesTransactionStatusFilter } from "@/data/mocks/transaction-status";

export type ClassInvoicesPageProps = {
  classDetail: ClassDetail;
};

export function buildClassPastDueInvoiceColumns(options?: {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return buildPastDueTransactionColumns({
    selectedId: options?.selectedId,
    onSelect: options?.onSelect,
    onRemind: (row) => toast.success(`Reminder sent to ${row.studentName} — demo mode, not delivered`),
  });
}

export function ClassInvoicesPage({ classDetail }: ClassInvoicesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { transactions } = useTransactions();

  const classRows = useMemo(
    () => transactions.filter((row) => row.classId === classDetail.id),
    [transactions, classDetail.id],
  );
  const pastDue = useMemo(
    () => classRows.filter((row) => getTransactionListStatus(row) === "past_due"),
    [classRows],
  );

  const selectedId = searchParams.get("transactionId");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const filteredAll = useMemo(() => {
    const query = search.trim().toLowerCase();
    return classRows.filter((row) => {
      if (
        query &&
        !row.studentName.toLowerCase().includes(query) &&
        !(row.invoiceNumber ?? "").toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter.length && !statusFilter.some((value) => matchesTransactionStatusFilter(row, value))) {
        return false;
      }
      if (typeFilter.length) {
        const typeKey = row.transactionType ?? "na";
        if (!typeFilter.includes(typeKey)) return false;
      }
      return true;
    });
  }, [classRows, search, statusFilter, typeFilter]);

  function selectTransaction(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("transactionId", id);
    else params.delete("transactionId");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const pastDueColumns = useMemo(
    () =>
      buildPastDueTransactionColumns({
        selectedId,
        onSelect: selectTransaction,
        showStudent: true,
        onRemind: (row) =>
          toast.success(`Reminder sent to ${row.studentName} — demo mode, not delivered`),
      }),
    [selectedId],
  );

  const allColumns = useMemo(
    () =>
      buildTransactionColumns({
        selectedId,
        onSelect: selectTransaction,
        showStudent: true,
        showClass: false,
      }),
    [selectedId],
  );

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 48,
      }}
    >
      {pastDue.length ? (
        <div
          style={{
            ...cardSurfaceStyle,
            boxSizing: "border-box",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Text weight="semibold">Past due transactions</Text>
          <GroupedTable
            data={pastDue}
            columns={pastDueColumns}
            getRowKey={(row) => row.id}
            isRowSelected={(row) => row.id === selectedId}
            appearance="nested"
            listChrome={false}
          />
        </div>
      ) : null}

      <div
        style={{
          boxSizing: "border-box",
          paddingInline: "calc(20px + var(--linear-border-width))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text weight="semibold">All transactions</Text>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search transactions…"
            filterGroups={[
              {
                label: "Status",
                options: TRANSACTION_STATUS_FILTER_OPTIONS,
                selected: statusFilter,
                onChange: setStatusFilter,
              },
              {
                label: "Type",
                options: TRANSACTION_TYPE_FILTER_OPTIONS,
                selected: typeFilter,
                onChange: setTypeFilter,
              },
            ]}
          />
        </div>
        {filteredAll.length ? (
          <GroupedTable
            data={filteredAll}
            columns={allColumns}
            getRowKey={(row) => row.id}
            isRowSelected={(row) => row.id === selectedId}
            listChrome
          />
        ) : (
          <Text color="secondary">No transactions match.</Text>
        )}
      </div>
    </div>
  );
}
