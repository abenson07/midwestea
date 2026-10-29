"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { SettingsInsetList } from "@/components/admin-migrate/patterns/settings/SettingsInsetList";
import {
  formatCentsAsUSD,
  formatShortDate,
} from "@/data/mocks/transaction-status";
import { getSession } from "@/lib/auth";
import type { PendingInvoiceRow } from "@/lib/admin-migrate/downloadInvoices";

type DownloadInvoiceRow = PendingInvoiceRow;

function buildColumns(): TableColumn<DownloadInvoiceRow>[] {
  return [
    {
      key: "invoice",
      header: "Invoice",
      width: proportional(0.6, { minWidth: 90 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.invoiceNumber ?? "—"}</span>
      ),
    },
    {
      key: "student",
      header: "Student",
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.studentName}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: proportional(1.2, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.studentEmail ?? "—"}</span>
      ),
    },
    {
      key: "class",
      header: "Class",
      width: proportional(0.7, { minWidth: 100 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.classCode}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: proportional(0.6, { minWidth: 90 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{formatCentsAsUSD(row.amountCents)}</span>
      ),
    },
    {
      key: "created",
      header: "Created",
      width: proportional(0.7, { minWidth: 110 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {formatShortDate(row.createdAt)}
        </span>
      ),
    },
  ];
}

/**
 * Calls the real export route (Bearer-authenticated) and saves the CSV it
 * returns. The route itself marks the exported transactions as downloaded.
 * Returns false when there was nothing to export.
 */
async function downloadInvoicesCsv(): Promise<boolean> {
  const { session } = await getSession();
  if (!session?.access_token) throw new Error("Not authenticated");

  const response = await fetch("/api/export-transactions-csv", {
    method: "GET",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    // Either "no new invoices" (200) or an error payload.
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Export failed (${response.status})`);
    return false;
  }
  if (!response.ok) throw new Error(`Export failed (${response.status})`);

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="(.+)"/);
  const filename = match?.[1] ?? `midwestea-invoices-${new Date().toISOString().slice(0, 10)}.csv`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}

export function DownloadInvoicesPage({ rows = [] }: { rows?: PendingInvoiceRow[] }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const pending = rows;
  const columns = useMemo(() => buildColumns(), []);

  async function handleDownload() {
    if (pending.length === 0 || downloading) return;
    setDownloading(true);
    try {
      const downloaded = await downloadInvoicesCsv();
      if (downloaded) {
        toast.success("Invoices downloaded");
      } else {
        toast.message("No new invoices to download");
      }
      // Re-fetch the server-rendered list so it reflects the new downloaded state.
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to download invoices: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <SettingsInsetList
      title="Download invoices"
      description="Invoices that have not been exported yet"
      action={
        <Button
          label="Download CSV"
          variant="primary"
          icon={<Download size={14} strokeWidth={1.75} />}
          onClick={handleDownload}
          disabled={pending.length === 0 || downloading}
        />
      }
      isEmpty={pending.length === 0}
      emptyLabel="No new invoices to download."
    >
      <GroupedTable
        data={pending}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome={false}
      />
    </SettingsInsetList>
  );
}
