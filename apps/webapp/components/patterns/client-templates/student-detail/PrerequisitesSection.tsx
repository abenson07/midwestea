"use client";

import { useMemo } from "react";
import { FileCheck2, FileText } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard, RowClickCell } from "@/components/patterns/client-templates/shared";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import type { StudentPrerequisiteRow } from "@/data/mocks/student-detail";

export type PrerequisitesSectionProps = {
  documents?: StudentPrerequisiteRow[];
  onReviewDocument?: (row: StudentPrerequisiteRow) => void;
};

function buildColumns(
  onReviewDocument?: (row: StudentPrerequisiteRow) => void,
): TableColumn<StudentPrerequisiteRow>[] {
  return [
    {
      key: "docName",
      header: "Document",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onReviewDocument?.(row)}>
          <FileText
            size={16}
            strokeWidth={1.75}
            style={{
              color: "var(--linear-color-ink-subtle)",
              flexShrink: 0,
              marginInlineEnd: 8,
            }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.docName}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "className",
      header: "Class",
      width: pixel(160),
      renderCell: (row) => (
        <RowClickCell onClick={() => onReviewDocument?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.className}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "action",
      header: "",
      width: pixel(48),
      renderCell: (row) => (
        <IconButton
          label="Review"
          variant="secondary"
          size="sm"
          icon={<FileCheck2 size={14} strokeWidth={1.75} />}
          onClick={() => onReviewDocument?.(row)}
        />
      ),
    },
  ];
}

/**
 * Prerequisite documents awaiting review for this student. Empty state
 * reuses the shared CTA treatment via `EmptyStateCard`; filled state is a
 * Document / Class `GroupedTable`.
 */
export function PrerequisitesSection({
  documents = [],
  onReviewDocument,
}: PrerequisitesSectionProps) {
  const columns = useMemo(() => buildColumns(onReviewDocument), [onReviewDocument]);
  const isEmpty = documents.length === 0;

  if (isEmpty) {
    return (
      <section
        data-slot="prerequisites-section"
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <EmptyStateCard
          label="No prerequisites waiting on review"
          icon={<FileCheck2 size={14} strokeWidth={1.75} />}
        />
      </section>
    );
  }

  return (
    <section
      data-slot="prerequisites-section"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: 32,
          paddingInline: 4,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: "20px",
            fontWeight: 500,
            color: "var(--linear-color-ink)",
          }}
        >
          Prerequisites to review
        </h2>
      </div>

      <GroupedTable
        data={documents}
        columns={columns}
        getRowKey={(row) => row.id}
        appearance="nested"
        hasHover
      />
    </section>
  );
}
