"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getTransactionsWithPayoutId,
  reconcileTransaction,
  undoReconciliation,
  type TransactionWithDetails,
} from "@/lib/payments";
import { Badge } from "@/components/admin-migrate/patterns/primitives/Badge";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { SettingsInsetList } from "@/components/admin-migrate/patterns/settings/SettingsInsetList";
import { formatCentsAsUSD, formatShortDate } from "@/data/mocks/transaction-status";

type ReconcileRow = TransactionWithDetails & { groupLabel: string } & Record<string, unknown>;

function payoutDateLabel(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function amountCents(row: TransactionWithDetails): number {
  return Math.round((row.amount_due ?? 0) * (row.quantity ?? 1));
}

function withGroupLabels(rows: TransactionWithDetails[]): ReconcileRow[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = row.payout_id ?? "unknown";
    totals.set(key, (totals.get(key) ?? 0) + amountCents(row));
  }
  return rows.map((row) => {
    const key = row.payout_id ?? "unknown";
    return {
      ...row,
      groupLabel: `${formatCentsAsUSD(totals.get(key) ?? 0)} paid out on ${payoutDateLabel(row.payout_date)}`,
    };
  });
}

/**
 * Real reconciliation, not mock — matches the old admin's working
 * /admin/reconcile page (same lib/payments.ts functions, already hardened
 * by PR #15's admin auth gate), reshaped to fit the settings inset-list
 * pattern the rest of this page uses. This is the "Payouts" section from
 * the source app's own nav, actually wired up: that page was built with
 * the right UI shape already, just pointed at mock data.
 */
export function ReconcilePage() {
  const [rows, setRows] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { transactions, error: fetchError } = await getTransactionsWithPayoutId();
    if (fetchError) setError(fetchError);
    setRows(transactions);
    setLoading(false);
  }

  const labeled = useMemo(() => withGroupLabels(rows), [rows]);
  const filtered = useMemo(() => {
    if (!search) return labeled;
    const q = search.toLowerCase();
    return labeled.filter(
      (row) =>
        (row.student_email ?? "").toLowerCase().includes(q) ||
        (row.invoice_number ?? "").toLowerCase().includes(q),
    );
  }, [labeled, search]);

  async function reconcile(id: string) {
    setPendingIds((prev) => new Set(prev).add(id));
    const { success, error: reconcileError } = await reconcileTransaction(id);
    if (reconcileError) {
      toast.error(reconcileError);
    } else if (success) {
      await load();
      toast.success("Reconciled");
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function undo(id: string) {
    setPendingIds((prev) => new Set(prev).add(id));
    const { success, error: undoError } = await undoReconciliation(id);
    if (undoError) {
      toast.error(undoError);
    } else if (success) {
      await load();
      toast.success("Reconciliation undone");
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const columns: TableColumn<ReconcileRow>[] = [
    {
      key: "email",
      header: "Customer email",
      width: proportional(1.2, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.student_email ?? "N/A"}</span>
      ),
    },
    {
      key: "amount",
      header: "Payment amount",
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{formatCentsAsUSD(amountCents(row))}</span>
      ),
    },
    {
      key: "paymentDate",
      header: "Payment date",
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {formatShortDate(row.payment_date ?? null)}
        </span>
      ),
    },
    {
      key: "invoice",
      header: "Invoice number",
      width: proportional(0.7, { minWidth: 100 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoice_number ?? "N/A"}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: proportional(0.7, { minWidth: 110 }),
      renderCell: (row) => {
        const pending = pendingIds.has(row.id);
        return row.reconciled ? (
          <span onMouseEnter={() => setHoveredId(row.id)} onMouseLeave={() => setHoveredId(null)}>
            {hoveredId === row.id ? (
              <Button label={pending ? "Undoing…" : "Undo"} variant="ghost" size="sm" disabled={pending} onClick={() => undo(row.id)} />
            ) : (
              <Badge label="Reconciled" />
            )}
          </span>
        ) : (
          <Button label={pending ? "Reconciling…" : "Reconcile"} variant="ghost" size="sm" disabled={pending} onClick={() => reconcile(row.id)} />
        );
      },
    },
  ];

  return (
    <SettingsInsetList
      title="Reconcile"
      description="Transactions with payout IDs"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search invoices…"
      isEmpty={!loading && filtered.length === 0}
      emptyLabel={error ?? "No transactions with payout IDs found."}
    >
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.groupLabel}
        listChrome={false}
      />
    </SettingsInsetList>
  );
}
