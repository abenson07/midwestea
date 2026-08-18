"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { PREREQUISITE_STATUS_COLOR, PREREQUISITE_STATUS_LABEL } from "../classes/prerequisiteStatus";
import type { StudentPrerequisiteSubmissionRow } from "./studentData";

export type StudentPrerequisiteSubmissionsPageProps = {
  rows: StudentPrerequisiteSubmissionRow[];
};

const COLUMNS: TableColumn<StudentPrerequisiteSubmissionRow>[] = [
  {
    key: "className",
    header: "Class",
    width: proportional(1, { minWidth: 160 }),
    renderCell: (row) => row.className,
  },
  {
    key: "type",
    header: "Prerequisite",
    width: proportional(1, { minWidth: 160 }),
    renderCell: (row) => row.type,
  },
  {
    key: "status",
    header: "Status",
    width: pixel(180),
    renderCell: (row) => (
      <span style={{ color: PREREQUISITE_STATUS_COLOR[row.status], fontSize: 13, fontWeight: 500 }}>
        {PREREQUISITE_STATUS_LABEL[row.status]}
      </span>
    ),
  },
  {
    key: "issuedOn",
    header: "Issued",
    width: pixel(120),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.issuedOn || "—"}</span>
    ),
  },
  {
    key: "expiresOn",
    header: "Expires",
    width: pixel(120),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.expiresOn || "Never"}</span>
    ),
  },
];

/** Full prerequisite submission history for one student, across every class. */
export function StudentPrerequisiteSubmissionsPage({ rows }: StudentPrerequisiteSubmissionsPageProps) {
  return (
    <div style={{ boxSizing: "border-box", padding: "32px 24px 64px" }}>
      <div
        style={{
          ...cardSurfaceStyle,
          boxSizing: "border-box",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Text weight="semibold">Prerequisite submissions</Text>
        {rows.length ? (
          <GroupedTable data={rows} columns={COLUMNS} getRowKey={(row) => row.id} listChrome />
        ) : (
          <Text color="secondary">No prerequisite submissions yet.</Text>
        )}
      </div>
    </div>
  );
}
