"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { pixel, proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { RowClickCell, useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { classDetailHref } from "../catalog/catalogMocks";
import { classDetailFor, type ClassDetail } from "../classes/classMocks";
import {
  GenerateCertificateModal,
  type CertificateTarget,
  type GenerateCertificateResult,
} from "../classes/GenerateCertificateModal";
import { useTransactions } from "../payments/useTransactions";
import { isClassClosed } from "../classes/classTableColumns";
import {
  documentsForStudent,
  enrollmentPaymentStatus,
  enrollmentsFor,
} from "./studentData";
import type { EnrollmentPaymentStatus, PastClassStatus, StudentEnrollment } from "./types";

const PAYMENT_COLOR: Record<EnrollmentPaymentStatus, string> = {
  "Registration fee past due": "#eb5757",
  "Tuition A past due": "#eb5757",
  "Tuition B past due": "#eb5757",
  "All paid": "#27a644",
  "First payment paid": "#27a644",
  "Registration fee paid": "#27a644",
  Pending: "#f2994a",
  "No payments yet": "#8a8f98",
};

const OUTCOME_COLOR: Record<PastClassStatus, string> = {
  Graduated: "#27a644",
  Failed: "#eb5757",
  Dropped: "#8a8f98",
};

function StatusBadge({ label, color }: { label: string; color: string }) {
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
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

type ClassTableRow = {
  enrollment: StudentEnrollment;
  classId: string;
  classCode: string;
  className: string;
  enrolledAt: string;
  paymentStatus: EnrollmentPaymentStatus;
  outcome?: PastClassStatus;
  certificateHref?: string;
  enrollmentId?: string;
  certificationLengthYears?: number | null;
};

function stopRowClick(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

const certificateLinkStyle = {
  color: "var(--linear-color-accent)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
} as const;

function buildColumns(
  onSelect: (classId: string) => void,
  showPastOutcome: boolean,
  onGenerateCertificate: (row: ClassTableRow) => void,
): TableColumn<ClassTableRow>[] {
  const columns: TableColumn<ClassTableRow>[] = [
    {
      key: "classId",
      header: "Class ID",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.classId)}>
          <span style={{ fontWeight: 500 }}>{row.classCode}</span>
        </RowClickCell>
      ),
    },
    {
      key: "className",
      header: "Class name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.classId)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.className}</span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolled",
      header: "Enrolled",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.classId)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.enrolledAt}</span>
        </RowClickCell>
      ),
    },
    {
      key: "payment",
      header: "Payment status",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.classId)}>
          <StatusBadge label={row.paymentStatus} color={PAYMENT_COLOR[row.paymentStatus]} />
        </RowClickCell>
      ),
    },
  ];

  if (showPastOutcome) {
    columns.push({
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.classId)}>
          {row.outcome ? (
            <StatusBadge label={row.outcome} color={OUTCOME_COLOR[row.outcome]} />
          ) : (
            <span style={{ color: "var(--linear-color-ink-tertiary)" }}>—</span>
          )}
        </RowClickCell>
      ),
    });
  }

  columns.push({
    key: "certificate",
    header: "Certificate",
    width: pixel(160),
    renderCell: (row) => {
      if (row.certificateHref) {
        return (
          <a
            href={row.certificateHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={certificateLinkStyle}
          >
            View PDF
          </a>
        );
      }
      if (!row.enrollmentId) {
        return <span style={{ color: "var(--linear-color-ink-tertiary)" }}>—</span>;
      }
      return (
        <span onClick={stopRowClick}>
          <Button
            label="Generate certificate"
            variant="secondary"
            size="sm"
            icon={<FileCheck size={13} strokeWidth={1.75} />}
            onClick={() => onGenerateCertificate(row)}
          />
        </span>
      );
    },
  });

  return columns;
}

export type StudentClassesSectionProps = {
  studentId: string;
  studentName?: string;
  enrollments?: StudentEnrollment[];
  classDetails?: ClassDetail[];
  onSelectClass?: (classId: string) => void;
};

function rowsFor(
  studentId: string,
  enrollments: StudentEnrollment[],
  classById: Map<string, ClassDetail>,
  invoices?: Parameters<typeof enrollmentPaymentStatus>[2],
  live = false,
): ClassTableRow[] {
  const documents = live ? [] : documentsForStudent(studentId);
  return enrollments.map((enrollment) => {
    const detail = classById.get(enrollment.classId) ?? (live ? undefined : classDetailFor(enrollment.classId));
    const issued = documents.find(
      (doc) => doc.kind === "issued" && doc.classId === enrollment.classId,
    );
    return {
      enrollment,
      classId: enrollment.classId,
      classCode: detail?.classCode ?? enrollment.classId,
      className: detail?.title || detail?.classCode || "Class",
      enrolledAt: enrollment.enrolledAt,
      paymentStatus: enrollmentPaymentStatus(studentId, enrollment.classId, invoices),
      outcome: enrollment.outcome,
      certificateHref: enrollment.certificateHref ?? issued?.href,
      enrollmentId: enrollment.enrollmentId,
      certificationLengthYears: detail?.certificationLengthYears,
    };
  });
}

/** Stacked active and past class tables. */
export function StudentClassesSection({
  studentId,
  studentName,
  enrollments: enrollmentsProp,
  classDetails,
  onSelectClass,
}: StudentClassesSectionProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const { transactions } = useTransactions();
  const enrollments = enrollmentsProp ?? (live ? [] : enrollmentsFor(studentId));
  const classById = new Map((classDetails ?? []).map((row) => [row.id, row]));
  const detailFor = (classId: string) =>
    classById.get(classId) ?? (live ? undefined : classDetailFor(classId));
  const active = enrollments.filter((row) => {
    const detail = detailFor(row.classId);
    return detail ? !isClassClosed(detail) : true;
  });
  const past = enrollments.filter((row) => {
    const detail = detailFor(row.classId);
    return detail ? isClassClosed(detail) : false;
  });
  const [certificateRow, setCertificateRow] = useState<ClassTableRow | null>(null);

  function selectClass(classId: string) {
    if (onSelectClass) {
      onSelectClass(classId);
      return;
    }
    router.push(`${basePath}${classDetailHref(classId)}`);
  }

  function handleGenerateCertificate(row: ClassTableRow) {
    if (live && row.enrollmentId) {
      setCertificateRow(row);
      return;
    }
    toast.message(`Certificate generation for ${row.className} isn’t wired yet — demo mode`);
  }

  function handleCertificateIssued(_results: GenerateCertificateResult[]) {
    router.refresh();
  }

  const activeRows = rowsFor(studentId, active, classById, transactions, live);
  const pastRows = rowsFor(studentId, past, classById, transactions, live);
  const activeColumns = buildColumns(selectClass, false, handleGenerateCertificate);
  const pastColumns = buildColumns(selectClass, true, handleGenerateCertificate);
  const certificateTargets: CertificateTarget[] = certificateRow?.enrollmentId
    ? [{ enrollmentId: certificateRow.enrollmentId, studentId, studentName: studentName ?? "Student" }]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text weight="semibold">Active classes</Text>
        {activeRows.length ? (
          <GroupedTable
            data={activeRows}
            columns={activeColumns}
            getRowKey={(row) => row.classId}
            listChrome
          />
        ) : (
          <Text size="sm" color="secondary">
            Not currently enrolled in an open class.
          </Text>
        )}
      </section>
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text weight="semibold">Past Classes</Text>
        {pastRows.length ? (
          <GroupedTable
            data={pastRows}
            columns={pastColumns}
            getRowKey={(row) => row.classId}
            listChrome
          />
        ) : (
          <Text size="sm" color="secondary">
            No past classes yet.
          </Text>
        )}
      </section>
      <GenerateCertificateModal
        isOpen={certificateRow != null}
        onClose={() => setCertificateRow(null)}
        className={certificateRow?.className ?? ""}
        defaultDurationYears={certificateRow?.certificationLengthYears}
        targets={certificateTargets}
        onIssued={handleCertificateIssued}
      />
    </div>
  );
}
