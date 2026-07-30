"use client";

import { FileCheck2, FileText } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import type { ClassPrerequisiteRow } from "@/data/mocks/class-detail";

export type PrerequisitesSectionProps = {
  documents?: ClassPrerequisiteRow[];
  onReviewDocument?: (row: ClassPrerequisiteRow) => void;
};

/**
 * Prerequisite documents awaiting review. Empty state reuses the
 * mixed-content CTA treatment via `EmptyStateCard`.
 */
export function PrerequisitesSection({
  documents = [],
  onReviewDocument,
}: PrerequisitesSectionProps) {
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

      {documents.length === 0 ? (
        <EmptyStateCard
          label="No prerequisites waiting on review"
          icon={<FileCheck2 size={14} strokeWidth={1.75} />}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onReviewDocument?.(doc)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 44,
                paddingInline: 8,
                borderRadius: 6,
              }}
            >
              <FileText
                size={16}
                strokeWidth={1.75}
                style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
              />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  color: "var(--linear-color-ink)",
                }}
              >
                {doc.docName}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 13,
                  color: "var(--linear-color-ink-subtle)",
                }}
              >
                {doc.studentName}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 13,
                  color: "var(--linear-color-ink-subtle)",
                }}
              >
                {doc.submittedAt}
              </span>
              <IconButton
                label="Review"
                variant="secondary"
                size="sm"
                icon={<FileCheck2 size={14} strokeWidth={1.75} />}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
