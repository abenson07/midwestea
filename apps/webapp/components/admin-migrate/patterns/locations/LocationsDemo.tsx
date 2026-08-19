"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsInsetList } from "@/components/patterns/client-templates-migrate/settings/SettingsInsetList";
import { LocationDetailPanel } from "./LocationDetailPanel";
import { AddLocationModal } from "./AddLocationModal";
import { INITIAL_LOCATION_ROWS, hasMapsUrl, locationFieldDisplay } from "./locationData";
import type { LocationRow } from "./types";

/** 12-column table. Table takes all 12 until a row is selected, then it shifts to 9 + 3. */
const LOCATIONS_GRID = { columns: 12, left: 9, right: 3, gap: 24 } as const;

const mapsLinkStyle = {
  color: "var(--linear-color-accent)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
} as const;

function buildColumns(
  selectedId: string | null,
  onSelect: (id: string) => void,
): TableColumn<LocationRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span
            style={{
              color: "var(--linear-color-ink)",
              fontWeight: row.id === selectedId ? 600 : undefined,
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "street",
      header: "Street",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {locationFieldDisplay(row.street)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "city",
      header: "City",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {locationFieldDisplay(row.city)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "state",
      header: "State",
      width: pixel(80),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {locationFieldDisplay(row.state)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "zip",
      header: "Zip",
      width: pixel(90),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {locationFieldDisplay(row.zip)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "mapsUrl",
      header: "Maps URL",
      width: pixel(100),
      renderCell: (row) =>
        hasMapsUrl(row.mapsUrl) ? (
          <a
            href={row.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={mapsLinkStyle}
          >
            Link
          </a>
        ) : (
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>—</span>
        ),
    },
  ];
}

export type LocationsDemoProps = {
  /** When omitted, the table stays on demo mocks (`/admin-preview`). */
  rows?: LocationRow[];
};

export function LocationsDemo({ rows: rowsProp }: LocationsDemoProps = {}) {
  const live = useIsNewAdminMigrate();
  const [rows, setRows] = useState<LocationRow[]>(rowsProp ?? (live ? [] : INITIAL_LOCATION_ROWS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const columns = useMemo(() => buildColumns(selectedId, setSelectedId), [selectedId]);
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.street.toLowerCase().includes(q),
    );
  }, [rows, search]);

  function saveLocation(next: LocationRow) {
    setRows((prev) => prev.map((row) => (row.id === next.id ? next : row)));
  }

  function createLocation(data: Omit<LocationRow, "id">) {
    const created: LocationRow = { ...data, id: `loc-${Date.now()}` };
    setRows((prev) => [created, ...prev]);
    setSelectedId(created.id);
  }

  return (
    <>
      <SettingsInsetList
        title="Locations"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search locations…"
        action={
          <Button
            label="Add location"
            variant="primary"
            icon={<Plus size={14} strokeWidth={1.75} />}
            onClick={() => setIsCreateOpen(true)}
          />
        }
        isEmpty={filtered.length === 0}
        emptyLabel="No locations yet. Add one to get started."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selected
              ? `repeat(${LOCATIONS_GRID.left}, minmax(0, 1fr)) minmax(280px, 1fr)`
              : `repeat(${LOCATIONS_GRID.columns}, minmax(0, 1fr))`,
            gap: selected ? LOCATIONS_GRID.gap : 0,
            alignItems: "start",
          }}
        >
          <div
            style={{
              gridColumn: `span ${selected ? LOCATIONS_GRID.left : LOCATIONS_GRID.columns}`,
              minWidth: 0,
            }}
          >
            <GroupedTable
              data={filtered}
              columns={columns}
              getRowKey={(row) => row.id}
              isRowSelected={(row) => row.id === selectedId}
              listChrome={false}
            />
          </div>
          {selected ? (
            <div style={{ gridColumn: `span ${LOCATIONS_GRID.right}`, minWidth: 0 }}>
              <LocationDetailPanel
                key={selected.id}
                location={selected}
                onSave={saveLocation}
                onClose={() => setSelectedId(null)}
              />
            </div>
          ) : null}
        </div>
      </SettingsInsetList>

      <AddLocationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createLocation}
      />
    </>
  );
}
