"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { RowClickCell, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { pixel, proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { formatCalendarDate } from "@/lib/dates";
import { SettingsInsetList } from "@/components/admin-migrate/patterns/settings/SettingsInsetList";
import { ArchivePrerequisiteModal } from "./ArchivePrerequisiteModal";
import { PrerequisiteFormModal, type PrerequisiteFormValues } from "./PrerequisiteFormModal";
import { INITIAL_PREREQUISITES } from "./prerequisiteData";
import {
  expirationLabel,
  inputTypeLabel,
  type PrerequisiteInputType,
  type PrerequisiteRow,
} from "./types";
import {
  archivePrerequisiteType,
  createPrerequisiteType,
  updatePrerequisiteType,
} from "@/lib/prerequisites";

/** UI uses "file"; the DB column (and its CHECK constraint) uses "file_upload". */
function toDbInputType(inputType: PrerequisiteInputType): "file_upload" | "date" | "text" | "checkbox" {
  return inputType === "file" ? "file_upload" : inputType;
}

/** UI uses "never"; the DB's expiration_rule CHECK constraint uses "none". */
function toDbExpirationRule(expiration: "never" | "fixed_date" | "duration_from_issue"): "none" | "fixed_date" | "duration_from_issue" {
  return expiration === "never" ? "none" : expiration;
}

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

  async function handleSubmit(values: PrerequisiteFormValues) {
    if (!live) {
      // /admin-preview demo sandbox only — no backing project to write to.
      if (editing) {
        setRows((prev) => prev.map((row) => (row.id === editing.id ? { ...row, ...values } : row)));
      } else {
        setRows((prev) => [
          { ...values, id: `prereq-${Date.now()}`, createdOn: new Date().toISOString().slice(0, 10), archived: false },
          ...prev,
        ]);
      }
      toast.success(`${values.name} saved — demo mode, saved locally only`);
      return;
    }

    const input = {
      name: values.name,
      input_type: toDbInputType(values.inputType),
      description: values.description || null,
      required_by_default: values.requiredByDefault,
      expiration_rule: toDbExpirationRule(values.expiration),
      expiration_duration_months: values.expiration === "duration_from_issue" ? values.validMonths : null,
    };

    if (editing) {
      const result = await updatePrerequisiteType(editing.id, input);
      if (!result.success) {
        toast.error(result.error || "Failed to save prerequisite");
        return;
      }
      setRows((prev) => prev.map((row) => (row.id === editing.id ? { ...row, ...values } : row)));
      toast.success(`${values.name} saved`);
      return;
    }

    const result = await createPrerequisiteType(input);
    if (!result.success || !result.prerequisiteType) {
      toast.error(result.error || "Failed to add prerequisite");
      return;
    }
    setRows((prev) => [
      { ...values, id: result.prerequisiteType!.id, createdOn: new Date().toISOString().slice(0, 10), archived: false },
      ...prev,
    ]);
    toast.success(`${values.name} added`);
  }

  async function confirmArchive() {
    if (!archiving) return;
    const name = archiving.name;
    if (live) {
      const result = await archivePrerequisiteType(archiving.id);
      if (!result.success) {
        toast.error(result.error || "Failed to archive prerequisite");
        return;
      }
    }
    setRows((prev) =>
      prev.map((row) => (row.id === archiving.id ? { ...row, archived: true } : row)),
    );
    setArchiving(null);
    toast.success(`${name} archived — it stays on classes that already use it`);
  }

  function restore(row: PrerequisiteRow) {
    // Not wired to real persistence — restore-from-archive isn't on the
    // critical path for the current test flows. archivePrerequisiteType()
    // sets archived_at; there's no corresponding "clear it" helper yet.
    setRows((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, archived: false } : item)),
    );
    toast.success(`${row.name} restored to Active (UI only — not yet saved)`);
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
