"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { SettingsInsetList } from "@/components/admin-migrate/patterns/settings/SettingsInsetList";
import { AddStaffPersonModal } from "./AddStaffPersonModal";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { addStaffPerson, getStaffRows, updateStaffPerson } from "./staffData";
import { StaffDetailPanel } from "./StaffDetailPanel";
import { StaffTable } from "./StaffTable";
import { addStaffLabel, matchesStaffView, type StaffRow, type StaffView } from "./types";

const STAFF_GRID = { columns: 12, left: 11, right: 1, gap: 24 } as const;

function matchesSearch(row: StaffRow, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
}

export type StaffDemoProps = {
  view: StaffView;
  /** Real admin rows, fetched server-side — only meaningful for view="admin". Trainers has no real data source yet. */
  admins?: StaffRow[];
};

/**
 * Staff roster for Trainers or Admins — rendered inside the settings shell.
 */
export function StaffDemo({ view, admins }: StaffDemoProps) {
  const live = useIsNewAdminMigrate();
  const [rows, setRows] = useState<StaffRow[]>(() =>
    live ? (view === "admin" ? (admins ?? []) : []) : getStaffRows(),
  );
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const title = view === "trainers" ? "Trainers" : "Admins";

  const filtered = useMemo(
    () => rows.filter((row) => matchesStaffView(row, view) && matchesSearch(row, search)),
    [rows, view, search],
  );

  function handleAdd(input: Parameters<typeof addStaffPerson>[0]) {
    const created = addStaffPerson(input);
    setRows((prev) => (live ? [...prev, created] : getStaffRows()));
    setSelectedId(created.id);
  }

  function savePerson(next: StaffRow) {
    updateStaffPerson(next);
    setRows((prev) => (live ? prev.map((row) => (row.id === next.id ? next : row)) : getStaffRows()));
  }

  const noun = view === "trainers" ? "trainers" : "admins";
  const emptyLabel = search ? `No ${noun} match "${search}".` : `No ${noun} yet.`;

  return (
    <>
      <SettingsInsetList
        title={title}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email"
        action={
          <Button
            label={addStaffLabel(view)}
            variant="primary"
            icon={<Plus size={14} strokeWidth={1.75} />}
            onClick={() => setIsAddOpen(true)}
          />
        }
        isEmpty={filtered.length === 0}
        emptyLabel={emptyLabel}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selected
              ? `repeat(${STAFF_GRID.left}, minmax(0, 1fr)) minmax(280px, 1fr)`
              : `repeat(${STAFF_GRID.columns}, minmax(0, 1fr))`,
            gap: selected ? STAFF_GRID.gap : 0,
            alignItems: "start",
          }}
        >
          <div
            style={{
              gridColumn: `span ${selected ? STAFF_GRID.left : STAFF_GRID.columns}`,
              minWidth: 0,
            }}
          >
            <StaffTable data={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          {selected ? (
            <div style={{ gridColumn: `span ${STAFF_GRID.right}`, minWidth: 0 }}>
              <StaffDetailPanel
                key={selected.id}
                person={selected}
                onSave={savePerson}
                onClose={() => setSelectedId(null)}
              />
            </div>
          ) : null}
        </div>
      </SettingsInsetList>

      <AddStaffPersonModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}
