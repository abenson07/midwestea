"use client";

import { useRouter } from "next/navigation";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { RowClickCell, useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { classDetailHref } from "../catalog/catalogMocks";
import { classDetailFor, type ClassDetail } from "../classes/classMocks";
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
      certificateHref: issued?.href,
    };
  });
}

/** Stacked active and past class tables. */
export function StudentClassesSection({
  studentId,
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

  function selectClass(classId: string) {
    if (onSelectClass) {
      onSelectClass(classId);
      return;
    }
    router.push(`${basePath}${classDetailHref(classId)}`);
  }

  const activeRows = rowsFor(studentId, active, classById, transactions, live);
  const pastRows = rowsFor(studentId, past, classById, transactions, live);
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
