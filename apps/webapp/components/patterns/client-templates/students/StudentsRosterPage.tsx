"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleStudents, type StudentRow } from "@/data/mocks/students";
import { sampleProgramClasses } from "@/data/mocks/classes";

const activeClassCodes = new Set(
  sampleProgramClasses
    .filter((cls) => cls.status === "active" || cls.status === "enrolling")
    .map((cls) => cls.code),
);

export function isActiveStudent(row: StudentRow): boolean {
  return row.classes.some((code) => activeClassCodes.has(code));
}

function ClassPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        paddingInline: 7,
        borderRadius: 999,
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 11,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function buildColumns(
  onSelectStudent: (row: StudentRow) => void,
): TableColumn<StudentRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent(row)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "classes",
      header: "Classes",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent(row)}>
          <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
            {row.classes.map((code) => (
              <ClassPill key={code} label={code} />
            ))}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "studentSince",
      header: "Student Since",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectStudent(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.studentSince}
          </span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Org-wide student roster — every student across every class. Rows link to
 * a per-student detail page (`/admin-preview/students/[studentId]`, a
 * placeholder for now — the real detail page is defined separately).
 */
export type StudentsView = "all" | "active";

export function StudentsRosterPage({ view = "all" }: { view?: StudentsView }) {
  const router = useRouter();

  const columns = useMemo(
    () => buildColumns((row) => router.push(`/admin-preview/students/${row.id}`)),
    [router],
  );

  const data = useMemo(
    () => (view === "active" ? sampleStudents.filter(isActiveStudent) : sampleStudents),
    [view],
  );

  return (
    <div
      style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}
    >
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome
      />
    </div>
  );
}
