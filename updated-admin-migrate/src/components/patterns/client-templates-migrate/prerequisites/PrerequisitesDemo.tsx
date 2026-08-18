"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { Button } from "@/components/patterns/primitives/Button";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { formatCalendarDate } from "@/lib/dates";
import { SettingsInsetList } from "@/components/patterns/client-templates-migrate/settings/SettingsInsetList";
import { ArchivePrerequisiteModal } from "./ArchivePrerequisiteModal";
import { PrerequisiteFormModal, type PrerequisiteFormValues } from "./PrerequisiteFormModal";
import { INITIAL_PREREQUISITES } from "./prerequisiteData";
import {
  expirationLabel,
  inputTypeLabel,
  type PrerequisiteRow,
} from "./types";

function buildColumns(options: {
  onEdit: (row: PrerequisiteRow) => void;
  onArchive: (row: PrerequisiteRow) => void;
  onRestore: (row: PrerequisiteRow) => void;
}): TableColumn<PrerequisiteRow>[] {
  const { onEdit, onArchive, onRestore } = options;

  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1.4, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={row.archived ? undefined : () => onEdit(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "inputType",
      header: "Input type",
      width: pixel(130),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {inputTypeLabel(row.inputType)}
        </span>
      ),
    },
    {
      key: "required",
      header: "Required",
      width: pixel(100),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {row.requiredByDefault ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "expiration",
      header: "Expiration",
      width: pixel(180),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{expirationLabel(row)}</span>
      ),
    },
    {
      key: "created",
      header: "Created",
      width: pixel(120),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>
          {formatCalendarDate(row.createdOn)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: pixel(148),
      renderCell: (row) => (
        <div
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          onClick={(event) => event.stopPropagation()}
        >
          {row.archived ? (
            <Button label="Restore" variant="ghost" size="sm" onClick={() => onRestore(row)} />
          ) : (
            <>
              <Button label="Edit" variant="ghost" size="sm" onClick={() => onEdit(row)} />
              <Button label="Archive" variant="ghost" size="sm" onClick={() => onArchive(row)} />
            </>
          )}
        </div>
      ),
    },
  ];
}

/**
 * Global prerequisite catalog — one inset table grouped Active / Archived.
 */
export type PrerequisitesDemoProps = {
  /** When omitted, the catalog stays on demo mocks (`/admin-preview`). */
  rows?: PrerequisiteRow[];
};

export function PrerequisitesDemo({ rows: rowsProp }: PrerequisitesDemoProps = {}) {
  const live = useIsNewAdminMigrate();
  const [rows, setRows] = useState<PrerequisiteRow[]>(rowsProp ?? (live ? [] : INITIAL_PREREQUISITES));
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PrerequisiteRow | null>(null);
  const [archiving, setArchiving] = useState<PrerequisiteRow | null>(null);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => row.name.toLowerCase().includes(q));
  }, [rows, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row: PrerequisiteRow) {
    setEditing(row);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSubmit(values: PrerequisiteFormValues) {
    if (editing) {
      setRows((prev) =>
        prev.map((row) => (row.id === editing.id ? { ...row, ...values } : row)),
      );
      toast.success(`${values.name} saved — demo mode, saved locally only`);
      return;
    }

    const created: PrerequisiteRow = {
      ...values,
      id: `prereq-${Date.now()}`,
      createdOn: new Date().toISOString().slice(0, 10),
      archived: false,
    };
    setRows((prev) => [created, ...prev]);
    toast.success(`${created.name} added — demo mode, saved locally only`);
  }

  function confirmArchive() {
    if (!archiving) return;
    const name = archiving.name;
    setRows((prev) =>
      prev.map((row) => (row.id === archiving.id ? { ...row, archived: true } : row)),
    );
    setArchiving(null);
    toast.success(`${name} archived — it stays on classes that already use it`);
  }

  function restore(row: PrerequisiteRow) {
    setRows((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, archived: false } : item)),
    );
    toast.success(`${row.name} restored to Active`);
  }

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: openEdit,
        onArchive: setArchiving,
        onRestore: restore,
      }),
    [],
  );

  return (
    <>
      <SettingsInsetList
        title="Prerequisites"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search prerequisites…"
        action={
          <Button
            label="Add prerequisite"
            variant="primary"
            icon={<Plus size={14} strokeWidth={1.75} />}
            onClick={openCreate}
          />
        }
        isEmpty={filtered.length === 0}
        emptyLabel="No prerequisites yet. Add one to get started."
      >
        <GroupedTable
          data={filtered}
          columns={columns}
          getRowKey={(row) => row.id}
          groupBy={(row) => (row.archived ? "Archived" : "Active")}
          groupOrder={["Active", "Archived"]}
          listChrome={false}
        />
      </SettingsInsetList>

      <PrerequisiteFormModal
        isOpen={formOpen}
        editing={editing}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
      <ArchivePrerequisiteModal
        isOpen={archiving != null}
        name={archiving?.name ?? ""}
        onCancel={() => setArchiving(null)}
        onConfirm={confirmArchive}
      />
    </>
  );
}
