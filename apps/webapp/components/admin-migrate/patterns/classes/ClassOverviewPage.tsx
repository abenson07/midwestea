"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassDetailsCard } from "./ClassDetailsCard";
import { ClassPrerequisitesQueue } from "./ClassPrerequisitesQueue";
import { ClassPrerequisitesList } from "./ClassPrerequisitesList";
import { ClassActivityCard } from "./ClassActivityCard";
import { ClassDueInvoicesSection } from "./ClassDueInvoicesSection";
import { ClassRosterSection } from "./ClassRosterSection";
import { ClassStudentPaymentsCard } from "./ClassStudentPaymentsCard";
import { ClassRevenueCard } from "./ClassRevenueCard";
import {
  GenerateCertificateModal,
  type CertificateTarget,
  type GenerateCertificateResult,
} from "./GenerateCertificateModal";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { catalogKindForClass } from "../catalog/catalogMocks";
import { isClassClosed } from "./classTableColumns";
import {
  classDueInvoicesFor,
  classPrerequisiteQueueFor,
  classRevenueFor,
  type ClassActivityItem,
  type ClassDetail,
  type ClassRosterRow,
  type StudentToRemove,
} from "./classMocks";
import { useTransactions } from "../payments/useTransactions";

/** 24-column overview. Tweak `left` / `right` (must sum to `columns`). */
const OVERVIEW_GRID = {
  columns: 24,
  left: 17,
  right: 7,
  gap: 24,
} as const;

export type ClassOverviewPageProps = {
  classDetail: ClassDetail;
  roster: ClassRosterRow[];
  activity: ClassActivityItem[];
  onEditDetails?: () => void;
  onAddPrerequisite?: (name: string) => void;
  onRemoveStudent?: (student: StudentToRemove) => void;
};

export function ClassOverviewPage({
  classDetail,
  roster,
  activity,
  onEditDetails,
  onAddPrerequisite,
  onRemoveStudent,
}: ClassOverviewPageProps) {
  const router = useRouter();
  const live = useIsNewAdminMigrate();
  const { transactions } = useTransactions();
  const closed = isClassClosed(classDetail);
  const isCourse = catalogKindForClass(classDetail) === "Course";
  const showBanners = !closed && !isCourse;
  const canEdit = !closed;
  const revenue = live ? null : classRevenueFor(classDetail.id);
  const invoices = classDueInvoicesFor(classDetail.id, transactions);
  const submissions = live ? [] : classPrerequisiteQueueFor(classDetail.id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [reviewSubmissionId, setReviewSubmissionId] = useState<string | null>(null);
  const [selectedForCertificate, setSelectedForCertificate] = useState<Set<string>>(new Set());
  const [certificateTargets, setCertificateTargets] = useState<CertificateTarget[] | null>(null);

  // Certificate generation isn't tied to the class being closed — always selectable.
  const canSelectStudent = true;
  const selectedStudent = roster.find((row) => row.id === selectedStudentId) ?? null;

  function handleReviewPrerequisite(studentId: string) {
    const submission = submissions.find((row) => row.studentId === studentId);
    if (submission) setReviewSubmissionId(submission.id);
  }

  function openGenerateCertificate(rows: ClassRosterRow[]) {
    const targets = rows
      .filter((row): row is ClassRosterRow & { enrollmentId: string } => Boolean(row.enrollmentId))
      .map((row) => ({ enrollmentId: row.enrollmentId, studentId: row.id, studentName: row.name }));
    if (targets.length === 0) return;
    setCertificateTargets(targets);
  }

  function handleCertificatesIssued(results: GenerateCertificateResult[]) {
    const issuedIds = new Set(results.filter((row) => row.success).map((row) => row.enrollmentId));
    setSelectedForCertificate((prev) => {
      const next = new Set(prev);
      for (const row of roster) {
        if (row.enrollmentId && issuedIds.has(row.enrollmentId)) next.delete(row.id);
      }
      return next;
    });
    router.refresh();
  }

  useEffect(() => {
    if (!selectedStudentId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedStudentId(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedStudentId]);

  return (
    <div
      data-slot="class-content-page"
      className="class-overview-layout"
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
          .class-overview-layout {
            overflow: auto !important;
            height: auto !important;
            align-items: start !important;
          }
          .class-overview-layout > [data-slot="class-overview-main"],
          .class-overview-layout > [data-slot="class-overview-rail"] {
            grid-column: 1 / -1 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
      <div
        data-slot="class-overview-main"
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
        <ClassInfoBox classDetail={classDetail} />
        {showBanners ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: OVERVIEW_GRID.gap,
            }}
          >
            <ClassPrerequisitesQueue
              key={classDetail.id}
              classId={classDetail.id}
              submissions={submissions}
              reviewSubmissionId={reviewSubmissionId}
              onReviewClose={() => setReviewSubmissionId(null)}
            />
            <ClassDueInvoicesSection classId={classDetail.id} invoices={invoices} />
          </div>
        ) : !closed ? (
          <ClassPrerequisitesQueue
            key={classDetail.id}
            classId={classDetail.id}
            submissions={submissions}
            reviewSubmissionId={reviewSubmissionId}
            onReviewClose={() => setReviewSubmissionId(null)}
            hideBanner
          />
        ) : null}
        <ClassRosterSection
          rows={roster}
          classId={classDetail.id}
          selectedStudentId={canSelectStudent ? selectedStudentId : null}
          onSelectStudent={canSelectStudent ? setSelectedStudentId : undefined}
          onReviewPrerequisite={handleReviewPrerequisite}
          showCertificates
          showPrerequisites={!closed}
          selectedForCertificate={selectedForCertificate}
          onToggleSelectForCertificate={(id) =>
            setSelectedForCertificate((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onGenerateCertificateForRow={(row) => openGenerateCertificate([row])}
          onGenerateCertificateForSelected={() =>
            openGenerateCertificate(roster.filter((row) => selectedForCertificate.has(row.id)))
          }
        />
      </div>
      <div
        data-slot="class-overview-rail"
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
        {canSelectStudent && selectedStudent ? (
          <ClassStudentPaymentsCard
            classId={classDetail.id}
            className={classDetail.title}
            student={selectedStudent}
            requiredPrerequisites={classDetail.prerequisites}
            onClose={() => setSelectedStudentId(null)}
            onRemove={(row) => onRemoveStudent?.(row)}
            onReviewPrerequisite={(submissionId) => setReviewSubmissionId(submissionId)}
            onGenerateCertificate={(row) => openGenerateCertificate([row])}
          />
        ) : (
          <>
            <ClassDetailsCard
              classDetail={classDetail}
              onEditDetails={canEdit ? onEditDetails : undefined}
            />
            {closed && revenue ? <ClassRevenueCard revenue={revenue} variant="total" /> : null}
            {isCourse && !closed && revenue ? (
              <ClassRevenueCard revenue={revenue} variant="active" />
            ) : null}
            <ClassPrerequisitesList
              key={classDetail.id}
              items={classDetail.prerequisites}
              editable={canEdit}
              onAdd={onAddPrerequisite}
            />
            <ClassActivityCard items={activity} />
          </>
        )}
      </div>
      <GenerateCertificateModal
        isOpen={certificateTargets != null}
        onClose={() => setCertificateTargets(null)}
        className={classDetail.title}
        defaultDurationYears={classDetail.certificationLengthYears}
        targets={certificateTargets ?? []}
        onIssued={handleCertificatesIssued}
      />
    </div>
  );
}
