"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import {
  sampleStudentCertificates,
  sampleStudentDocuments,
  type StudentCertificateRow,
  type StudentDocumentRow,
} from "@/data/mocks/student-detail";

function buildCertificateColumns(
  onSelectCertificate?: (row: StudentCertificateRow) => void,
): TableColumn<StudentCertificateRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectCertificate?.(row)}>
          <FileText
            size={16}
            strokeWidth={1.75}
            style={{
              color: "var(--linear-color-ink-subtle)",
              flexShrink: 0,
              marginInlineEnd: 8,
            }}
          />
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "issuedDate",
      header: "Issued",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectCertificate?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.issuedDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "expiresDate",
      header: "Expires",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectCertificate?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.expiresDate}</span>
        </RowClickCell>
      ),
    },
  ];
}

function buildDocumentColumns(
  onSelectDocument?: (row: StudentDocumentRow) => void,
): TableColumn<StudentDocumentRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectDocument?.(row)}>
          <FileText
            size={16}
            strokeWidth={1.75}
            style={{
              color: "var(--linear-color-ink-subtle)",
              flexShrink: 0,
              marginInlineEnd: 8,
            }}
          />
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectDocument?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.uploadedAt}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type DocumentsPageProps = {
  onSelectCertificate?: (row: StudentCertificateRow) => void;
  onSelectDocument?: (row: StudentDocumentRow) => void;
};

/**
 * Full-width Documents view — two stacked tables: certificates the student
 * holds, and other documents they've uploaded.
 */
export function DocumentsPage({ onSelectCertificate, onSelectDocument }: DocumentsPageProps) {
  const certificateColumns = useMemo(
    () => buildCertificateColumns(onSelectCertificate),
    [onSelectCertificate],
  );
  const documentColumns = useMemo(
    () => buildDocumentColumns(onSelectDocument),
    [onSelectDocument],
  );

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: 32, paddingInline: 4 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              fontWeight: 500,
              color: "var(--linear-color-ink)",
            }}
          >
            Certificates
          </h2>
        </div>
        <GroupedTable
          data={sampleStudentCertificates}
          columns={certificateColumns}
          getRowKey={(row) => row.id}
          appearance="nested"
          hasHover
        />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: 32, paddingInline: 4 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              fontWeight: 500,
              color: "var(--linear-color-ink)",
            }}
          >
            Documents
          </h2>
        </div>
        <GroupedTable
          data={sampleStudentDocuments}
          columns={documentColumns}
          getRowKey={(row) => row.id}
          appearance="nested"
          hasHover
        />
      </section>
    </div>
  );
}
