"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";

type LocationStatus = "active" | "inactive";

type LocationRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  status: LocationStatus;
};

const LOCATION_ROWS: LocationRow[] = [
  { id: "loc-1", name: "Main Campus", address: "123 Main St", city: "Springfield", capacity: 40, status: "active" },
  { id: "loc-2", name: "Downtown Annex", address: "45 Oak Ave", city: "Springfield", capacity: 24, status: "active" },
  {
    id: "loc-3",
    name: "Westside Training Center",
    address: "900 Industrial Pkwy",
    city: "Springfield",
    capacity: 60,
    status: "active",
  },
  { id: "loc-4", name: "Mobile Unit", address: "—", city: "—", capacity: 12, status: "inactive" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const STATUS_COLOR: Record<LocationStatus, string> = {
  active: "#27a644",
  inactive: "#8a8f98",
};

function StatusPill({ status }: { status: LocationStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function buildColumns(): TableColumn<LocationRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "address",
      header: "Address",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.address}</span>
        </RowClickCell>
      ),
    },
    {
      key: "city",
      header: "City",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.city}</span>
        </RowClickCell>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.capacity}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell>
          <StatusPill status={row.status} />
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Copied structurally from Staff's Invoices table (no view tabs) — placeholder
 * rows until Locations gets a real data source.
 */
export function LocationsDemo() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const columns = useMemo(() => buildColumns(), []);

  const filtered = useMemo(
    () =>
      LOCATION_ROWS.filter((row) => {
        if (statusFilter.length && !statusFilter.includes(row.status)) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!row.name.toLowerCase().includes(q) && !row.city.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [search, statusFilter],
  );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Locations", icon: <MapPin size={16} strokeWidth={1.75} /> }}
            controls={
              <ListToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search locations…"
                filterGroups={[
                  {
                    label: "Status",
                    options: STATUS_OPTIONS,
                    selected: statusFilter,
                    onChange: setStatusFilter,
                  },
                ]}
              />
            }
          />
        }
      >
        <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
          <GroupedTable data={filtered} columns={columns} getRowKey={(row) => row.id} listChrome />
          {filtered.length === 0 ? (
            <div style={{ padding: 24 }}>
              <Text color="secondary">No locations match the current filters.</Text>
            </div>
          ) : null}
        </div>
      </FoundationLayout>
    </div>
  );
}
