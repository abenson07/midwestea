"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseClient } from "@midwestea/utils";
import { ClassBanner } from "../classes/ClassBanner";
import { ClassPrerequisitesQueue } from "../classes/ClassPrerequisitesQueue";
import { ClassActivityCard } from "../classes/ClassActivityCard";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { StudentInfoBox } from "./StudentInfoBox";
import { StudentDetailsCard } from "./StudentDetailsCard";
import { StudentDocumentsCard } from "./StudentDocumentsCard";
import { StudentClassesSection } from "./StudentClassesSection";
import { StudentClassInvoicesCard } from "./StudentClassInvoicesCard";
import {
  activityForStudent,
  documentsForStudent,
  pendingPrereqsForStudent,
} from "./studentData";
import type { StudentEnrollment, StudentRecord } from "./types";
import { classDetailFor, type ClassDetail } from "../classes/classMocks";
import { classDetailHref } from "../catalog/catalogMocks";
import { useTransactions } from "../payments/useTransactions";
import { VoidAndReissueModal } from "../payments/VoidAndReissueModal";
import { getTransactionListStatus, matchesTransactionStatusFilter } from "@/data/mocks/transaction-status";

const OVERVIEW_GRID = {
  columns: 24,
  left: 17,
  right: 7,
  gap: 24,
} as const;

export type StudentOverviewPageProps = {
  student: StudentRecord;
  onEditDetails?: () => void;
  enrollments?: StudentEnrollment[];
  classDetails?: ClassDetail[];
};

export function StudentOverviewPage({
  student,
  onEditDetails,
  enrollments,
  classDetails,
}: StudentOverviewPageProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const { transactions, updateTransaction } = useTransactions();
  const submissions = live ? [] : pendingPrereqsForStudent(student.id);
  const pastDue = transactions.filter(
    (row) => row.studentId === student.id && getTransactionListStatus(row) === "past_due",
  );
  const documents = live ? [] : documentsForStudent(student.id);
  const activity = live ? [] : activityForStudent(student.id);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [voidReissueOpen, setVoidReissueOpen] = useState(false);

  const classById = new Map((classDetails ?? []).map((row) => [row.id, row]));
  const selectedClassDetail = selectedClassId
    ? (classById.get(selectedClassId) ?? (live ? undefined : classDetailFor(selectedClassId)))
    : undefined;
  const selectedClassInvoices = selectedClassId
    ? transactions.filter((row) => row.studentId === student.id && row.classId === selectedClassId)
    : [];
  const openInvoices = selectedClassInvoices.filter((row) =>
    matchesTransactionStatusFilter(row, "open"),
  );

  async function confirmVoidAndReissue(
    voidedIds: string[],
    replacements: { amountCents: number; dueDateIso: string }[],
    payInFull: boolean,
  ): Promise<boolean> {
    // The route voids every pending invoice on one enrollment, so all of the
    // class's open invoices must belong to the same, known enrollment.
    const enrollmentIds = new Set(openInvoices.map((row) => row.enrollmentId));
    const enrollmentId = enrollmentIds.size === 1 ? [...enrollmentIds][0] : null;
    if (!enrollmentId) {
      toast.error("Can't void and reissue: these invoices aren't tied to a single enrollment.");
      return false;
    }
    try {
      const supabase = await createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not authenticated");
        return false;
      }
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}/void-and-reissue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          replacementInvoices: replacements.map((r) => ({
            amountCents: r.amountCents,
            dueDate: r.dueDateIso,
          })),
          payInFull,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        toast.error(result?.error || "Failed to void and reissue invoices");
        return false;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to void and reissue invoices");
      return false;
    }
    // Server succeeded. Mark the old rows cancelled locally and refetch so the
    // replacement rows appear with their real ids and Stripe links.
    for (const id of voidedIds) {
      updateTransaction(id, { transactionStatus: "cancelled" });
    }
    router.refresh();
    return true;
  }

  return (
    <div
      data-slot="student-content-page"
      className="student-overview-layout"
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "32px 24px 24px",
        display: "grid",
        gridTemplateColumns: `repeat(${OVERVIEW_GRID.columns}, minmax(0, 1fr))`,
        gap: OVERVIEW_GRID.gap,
        alignItems: "stretch",
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .student-overview-layout {
            overflow: auto !important;
            height: auto !important;
            align-items: start !important;
          }
          .student-overview-layout > [data-slot="student-overview-main"],
          .student-overview-layout > [data-slot="student-overview-rail"] {
            grid-column: 1 / -1 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
      <div
        data-slot="student-overview-main"
        style={{
          gridColumn: `span ${OVERVIEW_GRID.left}`,
          display: "flex",
          flexDirection: "column",
          gap: OVERVIEW_GRID.gap,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          paddingBottom: 40,
        }}
      >
        <StudentInfoBox student={student} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: OVERVIEW_GRID.gap,
          }}
        >
          <ClassPrerequisitesQueue submissions={submissions} />
          <ClassBanner
            icon={<Wallet size={16} strokeWidth={1.75} />}
            label={
              pastDue.length
                ? `${pastDue.length} Invoice${pastDue.length === 1 ? "" : "s"} past due`
                : "Payments on track"
            }
            onClick={() => router.push(`${basePath}/students/${student.id}/invoices`)}
          />
        </div>
        <StudentClassesSection
          studentId={student.id}
          studentName={student.name}
          enrollments={enrollments}
          classDetails={classDetails}
          onSelectClass={setSelectedClassId}
        />
      </div>
      <div
        data-slot="student-overview-rail"
        style={{
          gridColumn: `span ${OVERVIEW_GRID.right}`,
          display: "flex",
          flexDirection: "column",
          gap: OVERVIEW_GRID.gap,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          paddingBottom: 40,
        }}
      >
        {selectedClassId ? (
          <StudentClassInvoicesCard
            className={selectedClassDetail?.title ?? selectedClassId}
            invoices={selectedClassInvoices}
            hasOpenInvoices={openInvoices.length > 0}
            onClose={() => setSelectedClassId(null)}
            onGoToClass={() => router.push(`${basePath}${classDetailHref(selectedClassId)}`)}
            onVoidAndReissue={() => setVoidReissueOpen(true)}
          />
        ) : (
          <>
            <StudentDetailsCard student={student} onEditDetails={onEditDetails} />
            <StudentDocumentsCard documents={documents} />
            <ClassActivityCard items={activity} />
            <button
              type="button"
              onClick={() => router.push(`${basePath}/students/${student.id}/prerequisites`)}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--linear-color-accent)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              View all Prerequisite submissions
            </button>
          </>
        )}
      </div>
      <VoidAndReissueModal
        isOpen={voidReissueOpen}
        className={selectedClassDetail?.title ?? selectedClassId ?? ""}
        openInvoices={openInvoices}
        onClose={() => setVoidReissueOpen(false)}
        onConfirm={confirmVoidAndReissue}
      />
    </div>
  );
}
