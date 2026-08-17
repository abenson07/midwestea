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
import {
  classActivityFor,
  classDueInvoicesFor,
  classPrerequisiteQueueFor,
  classStudentPaymentFor,
  type ClassDetail,
  type ClassRosterRow,
} from "./classMocks";

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
  onEditDetails?: () => void;
};

export function ClassOverviewPage({
  classDetail,
  roster,
  onEditDetails,
}: ClassOverviewPageProps) {
  const invoices = classDueInvoicesFor(classDetail.id);
  const submissions = classPrerequisiteQueueFor(classDetail.id);
  const activity = classActivityFor(classDetail.id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudent = roster.find((row) => row.id === selectedStudentId) ?? null;
  const selectedPayment = selectedStudent ? classStudentPaymentFor(selectedStudent.id) : null;

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: OVERVIEW_GRID.gap,
          }}
        >
          <ClassPrerequisitesQueue key={classDetail.id} submissions={submissions} />
          <ClassDueInvoicesSection invoices={invoices} />
        </div>
        <ClassRosterSection
          rows={roster}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
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
          overflow: "hidden",
        }}
      >
        {selectedStudent && selectedPayment ? (
          <ClassStudentPaymentsCard
            student={selectedStudent}
            payment={selectedPayment}
            onClose={() => setSelectedStudentId(null)}
          />
        ) : (
          <>
            <ClassDetailsCard classDetail={classDetail} onEditDetails={onEditDetails} />
            <ClassPrerequisitesList key={classDetail.id} items={classDetail.prerequisites} />
            <ClassActivityCard items={activity} />
          </>
        )}
      </div>
    </div>
  );
}
