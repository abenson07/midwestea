"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleProgramClasses, type ProgramClassRow } from "@/data/mocks/classes";

const GROUP_ORDER = ["enrolling", "active", "recently-closed"];

const groupMeta: Record<string, { label: string; color: string }> = {
  enrolling: { label: "Enrolling", color: "#f2c94c" },
  active: { label: "Active", color: "#27a644" },
  "recently-closed": { label: "Recently Closed", color: "#8a8f98" },
};

function buildColumns(
  onSelect: (row: ProgramClassRow) => void,
): TableColumn<ProgramClassRow>[] {
  return [
    {
      key: "code",
      header: "Class",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>
            {row.code} · {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolled",
      header: "Enrolled",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.enrolledCount}/{row.capacity}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "price",
      header: "Price",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.price}</span>
        </RowClickCell>
      ),
    },
    {
      key: "startDate",
      header: "Starts",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.startDate}</span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Inline "Active Program Classes" card for the Classes overview — grouped by
 * enrolling / active / recently closed. Clicking any row goes to the Class
 * Detail demo page.
 */
export function ProgramClassesTable() {
  const router = useRouter();
  const columns = useMemo(
    () => buildColumns(() => router.push("/admin-preview/class-detail")),
    [router],
  );

  return (
    <NestedGroupedTable
      title="Active Program Classes"
      data={sampleProgramClasses}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={(row) => row.status}
      groupOrder={GROUP_ORDER}
      getGroupMeta={(key) => groupMeta[key]}
    />
  );
}

/**
 * Full-width "Active classes" view — same data/grouping, full canvas chrome.
 */
export function ActiveClassesFullTable() {
  const router = useRouter();
  const columns = useMemo(
    () => buildColumns(() => router.push("/admin-preview/class-detail")),
    [router],
  );

  return (
    <div
      style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}
    >
      <GroupedTable
        data={sampleProgramClasses}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => groupMeta[key]}
        listChrome
      />
    </div>
  );
}
