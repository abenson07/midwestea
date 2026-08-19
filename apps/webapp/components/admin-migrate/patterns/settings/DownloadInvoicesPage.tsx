"use client";

import { useMemo, useState } from "react";
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
import {
  getDownloadInvoiceRows,
  markInvoicesDownloaded,
  type DownloadInvoiceRow,
} from "@/data/mocks/download-invoices";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function downloadCsv(rows: DownloadInvoiceRow[]) {
  const header = ["Invoice number", "Student", "Email", "Class", "Amount", "Created"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.invoiceNumber ?? "",
        row.studentName,
        row.studentEmail ?? "",
        row.classCode,
        formatCentsAsUSD(row.amountCents),
        formatShortDate(row.createdAt),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `midwestea-invoices-${date}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

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

export function DownloadInvoicesPage() {
  const [rows, setRows] = useState(() => getDownloadInvoiceRows());
  const pending = useMemo(() => rows.filter((row) => !row.downloaded), [rows]);
  const columns = useMemo(() => buildColumns(), []);

  function handleDownload() {
    if (pending.length === 0) {
      toast.message("No new invoices to download");
      return;
    }
    downloadCsv(pending);
    markInvoicesDownloaded(pending.map((row) => row.id));
    setRows(getDownloadInvoiceRows());
    toast.success(`Downloaded ${pending.length} invoice${pending.length === 1 ? "" : "s"} — demo mode`);
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
          disabled={pending.length === 0}
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
