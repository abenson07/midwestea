"use client";

import { useEffect, useState } from "react";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassDetailsCard } from "./ClassDetailsCard";
import { ClassPrerequisitesQueue } from "./ClassPrerequisitesQueue";
import { ClassPrerequisitesList } from "./ClassPrerequisitesList";
import { ClassActivityCard } from "./ClassActivityCard";
import { ClassDueInvoicesSection } from "./ClassDueInvoicesSection";
import { ClassRosterSection } from "./ClassRosterSection";
import { ClassStudentPaymentsCard } from "./ClassStudentPaymentsCard";
import { ClassRevenueCard } from "./ClassRevenueCard";
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

  const canSelectStudent = !closed;
  const selectedStudent = roster.find((row) => row.id === selectedStudentId) ?? null;

  function handleReviewPrerequisite(studentId: string) {
    const submission = submissions.find((row) => row.studentId === studentId);
    if (submission) setReviewSubmissionId(submission.id);
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
          showCertificates={closed}
          showPrerequisites={!closed}
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
    </div>
  );
}
