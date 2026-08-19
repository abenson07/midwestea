"use client";

import { useMemo, useState } from "react";
import { proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { SettingsInsetList } from "@/components/admin-migrate/patterns/settings/SettingsInsetList";
import { AUDIT_LOG_ROWS, type AuditLogRow } from "@/data/mocks/audit-logs";
import { formatShortDate } from "@/data/mocks/transaction-status";

function buildColumns(): TableColumn<AuditLogRow>[] {
  return [
    {
      key: "at",
      header: "Time",
      width: proportional(0.8, { minWidth: 140 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{formatShortDate(row.at)}</span>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.actor}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)" }}>{row.action}</span>
      ),
    },
    {
      key: "target",
      header: "Target",
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.target}</span>
      ),
    },
  ];
}

export function LogsPage() {
  const [search, setSearch] = useState("");
  const columns = useMemo(() => buildColumns(), []);
  const filtered = useMemo(() => {
    if (!search) return AUDIT_LOG_ROWS;
    const q = search.toLowerCase();
    return AUDIT_LOG_ROWS.filter(
      (row) =>
        row.actor.toLowerCase().includes(q) ||
        row.action.toLowerCase().includes(q) ||
        row.target.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <SettingsInsetList
      title="Logs"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search logs…"
      isEmpty={filtered.length === 0}
      emptyLabel={search ? `No log entries match "${search}".` : "No log entries yet."}
    >
      <GroupedTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome={false}
      />
    </SettingsInsetList>
  );
}
