"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import { TransactionDetailPanel } from "../payments/TransactionDetailPanel";
import { useTransactions } from "../payments/useTransactions";
import {
  buildTransactionColumns,
  TRANSACTION_STATUS_FILTER_OPTIONS,
  TRANSACTION_TYPE_FILTER_OPTIONS,
} from "../payments/transactionColumns";
import { matchesTransactionStatusFilter } from "@/data/mocks/transaction-status";
import { enrollmentsFor } from "./studentData";
import type { StudentEnrollment } from "./types";

const INVOICES_GRID = { columns: 12, left: 11, right: 1, gap: 24 } as const;

export type StudentInvoicesPageProps = {
  studentId: string;
  enrollments?: StudentEnrollment[];
};

export function StudentInvoicesPage({ studentId, enrollments: enrollmentsProp }: StudentInvoicesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const live = useIsNewAdminMigrate();
  const { transactions, updateTransaction } = useTransactions();
  const enrollments = enrollmentsProp ?? (live ? [] : enrollmentsFor(studentId));

  const studentRows = useMemo(
    () => transactions.filter((row) => row.studentId === studentId),
    [transactions, studentId],
  );

  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("transactionId"));
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

  function selectTransaction(id: string | null) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("transactionId", id);
    else params.delete("transactionId");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const columns = useMemo(
    () =>
      buildTransactionColumns({
        selectedId,
        onSelect: selectTransaction,
        showStudent: false,
        showClass: false,
      }),
    [selectedId],
  );

  const classNameByClassId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of studentRows) {
      if (!map.has(row.classId)) map.set(row.classId, row.className);
    }
    return map;
  }, [studentRows]);

  /** Most-recent-enrollment-first; classes with invoices but no enrollment record sort last. */
  const groupOrder = useMemo(() => {
    const byRecency = [...enrollments].sort(
      (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
    );
    const ordered = byRecency.map((row) => row.classId);
    for (const classId of classNameByClassId.keys()) {
      if (!ordered.includes(classId)) ordered.push(classId);
    }
    return ordered;
  }, [enrollments, classNameByClassId]);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        padding: "32px 24px 24px",
        display: "grid",
        gridTemplateColumns: selected
          ? `repeat(${INVOICES_GRID.left}, minmax(0, 1fr)) minmax(360px, 1fr)`
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
          gap: 8,
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
          <Text weight="semibold">Invoices by class</Text>
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
              columns={columns}
              getRowKey={(row) => row.id}
              isRowSelected={(row) => row.id === selectedId}
              groupBy={(row) => row.classId}
              groupOrder={groupOrder}
              getGroupMeta={(classId) => ({ label: classNameByClassId.get(classId) ?? classId })}
              listChrome
            />
          </div>
        ) : (
          <Text color="secondary">No transactions match.</Text>
        )}
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
            title="Transaction Detail"
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
