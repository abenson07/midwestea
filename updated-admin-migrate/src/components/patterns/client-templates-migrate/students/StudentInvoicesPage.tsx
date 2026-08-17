"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import { TransactionDetailPanel } from "../payments/TransactionDetailPanel";
import { useTransactions } from "../payments/useTransactions";
import {
  buildPastDueTransactionColumns,
  buildTransactionColumns,
  TRANSACTION_STATUS_FILTER_OPTIONS,
  TRANSACTION_TYPE_FILTER_OPTIONS,
} from "../payments/transactionColumns";
import { getTransactionListStatus, matchesTransactionStatusFilter } from "@/data/mocks/transaction-status";

const INVOICES_GRID = { columns: 12, left: 11, right: 1, gap: 24 } as const;

type InvoiceTable = "pastDue" | "all";

export type StudentInvoicesPageProps = {
  studentId: string;
};

export function StudentInvoicesPage({ studentId }: StudentInvoicesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { transactions, updateTransaction } = useTransactions();

  const studentRows = useMemo(
    () => transactions.filter((row) => row.studentId === studentId),
    [transactions, studentId],
  );
  const pastDue = useMemo(
    () => studentRows.filter((row) => getTransactionListStatus(row) === "past_due"),
    [studentRows],
  );

  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("transactionId"));
  const [selectedTable, setSelectedTable] = useState<InvoiceTable | null>(
    searchParams.get("transactionId") ? "all" : null,
  );
  const selected = studentRows.find((row) => row.id === selectedId) ?? null;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return studentRows.filter((row) => {
      if (
        query &&
        !(row.invoiceNumber ?? "").toLowerCase().includes(query) &&
        !row.classCode.toLowerCase().includes(query) &&
        !row.className.toLowerCase().includes(query)
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
  }, [studentRows, search, statusFilter, typeFilter]);

  function selectTransaction(id: string | null, table: InvoiceTable | null = null) {
    setSelectedId(id);
    setSelectedTable(id ? table : null);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("transactionId", id);
    else params.delete("transactionId");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const pastDueSelectedId = selectedTable === "pastDue" ? selectedId : null;
  const allSelectedId = selectedTable === "all" ? selectedId : null;

  const pastDueColumns = useMemo(
    () =>
      buildPastDueTransactionColumns({
        selectedId: pastDueSelectedId,
        onSelect: (id) => selectTransaction(id, "pastDue"),
        showStudent: false,
        onRemind: (row) =>
          toast.success(`Reminder sent to ${row.studentName} — demo mode, not delivered`),
      }),
    [pastDueSelectedId],
  );

  const allColumns = useMemo(
    () =>
      buildTransactionColumns({
        selectedId: allSelectedId,
        onSelect: (id) => selectTransaction(id, "all"),
        showStudent: false,
        showClass: true,
      }),
    [allSelectedId],
  );

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        padding: "32px 24px 24px",
        display: "grid",
        gridTemplateColumns: selected
          ? `repeat(${INVOICES_GRID.left}, minmax(0, 1fr)) minmax(280px, 1fr)`
          : `repeat(${INVOICES_GRID.columns}, minmax(0, 1fr))`,
        gap: INVOICES_GRID.gap,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          gridColumn: `span ${selected ? INVOICES_GRID.left : INVOICES_GRID.columns}`,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 24,
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
              flexShrink: 0,
            }}
          >
            <Text weight="semibold">Past due transactions</Text>
            <GroupedTable
              data={pastDue}
              columns={pastDueColumns}
              getRowKey={(row) => row.id}
              isRowSelected={(row) => row.id === pastDueSelectedId}
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
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
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
          {filtered.length ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <GroupedTable
                data={filtered}
                columns={allColumns}
                getRowKey={(row) => row.id}
                isRowSelected={(row) => row.id === allSelectedId}
                listChrome
              />
            </div>
          ) : (
            <Text color="secondary">No transactions match.</Text>
          )}
        </div>
      </div>

      {selected ? (
        <div
          style={{
            gridColumn: `span ${INVOICES_GRID.right}`,
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <ClassSidebarSection
            title="Transaction Details"
            action={
              <IconButton
                label="Close transaction"
                variant="ghost"
                size="sm"
                icon={<X size={14} strokeWidth={1.75} />}
                onClick={() => selectTransaction(null)}
              />
            }
          >
            <TransactionDetailPanel
              transaction={selected}
              context="student"
              onChange={(patch) => updateTransaction(selected.id, patch)}
            />
          </ClassSidebarSection>
        </div>
      ) : null}
    </div>
  );
}
