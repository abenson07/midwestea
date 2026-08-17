"use client";

import { useRouter } from "next/navigation";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { classDetailHref } from "../catalog/catalogMocks";
import { classDetailFor } from "../classes/classMocks";
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
};

const certificateLinkStyle = {
  color: "var(--linear-color-accent)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
} as const;

function buildColumns(
  onSelect: (classId: string) => void,
  showPastOutcome: boolean,
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
    columns.push(
      {
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
      },
      {
        key: "certificate",
        header: "Certificate",
        width: pixel(120),
        renderCell: (row) =>
          row.outcome === "Graduated" && row.certificateHref ? (
            <a
              href={row.certificateHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              style={certificateLinkStyle}
            >
              View PDF
            </a>
          ) : (
            <span style={{ color: "var(--linear-color-ink-tertiary)" }}>—</span>
          ),
      },
    );
  }

  return columns;
}

export type StudentClassesSectionProps = {
  studentId: string;
};

function rowsFor(
  studentId: string,
  enrollments: StudentEnrollment[],
): ClassTableRow[] {
  const documents = documentsForStudent(studentId);
  return enrollments.map((enrollment) => {
    const detail = classDetailFor(enrollment.classId);
    const issued = documents.find(
      (doc) => doc.kind === "issued" && doc.classId === enrollment.classId,
    );
    return {
      enrollment,
      classId: enrollment.classId,
      classCode: detail.classCode,
      className: detail.title || detail.classCode,
      enrolledAt: enrollment.enrolledAt,
      paymentStatus: enrollmentPaymentStatus(studentId, enrollment.classId),
      outcome: enrollment.outcome,
      certificateHref: issued?.href,
    };
  });
}

/** Stacked active and past class tables. */
export function StudentClassesSection({ studentId }: StudentClassesSectionProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const enrollments = enrollmentsFor(studentId);
  const active = enrollments.filter((row) => !isClassClosed(classDetailFor(row.classId)));
  const past = enrollments.filter((row) => isClassClosed(classDetailFor(row.classId)));

  function selectClass(classId: string) {
    router.push(`${basePath}${classDetailHref(classId)}`);
  }

  const activeRows = rowsFor(studentId, active);
  const pastRows = rowsFor(studentId, past);
  const activeColumns = buildColumns(selectClass, false);
  const pastColumns = buildColumns(selectClass, true);

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
    </div>
  );
}
