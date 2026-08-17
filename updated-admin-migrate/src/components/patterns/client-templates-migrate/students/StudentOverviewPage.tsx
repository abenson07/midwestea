"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { ClassBanner } from "../classes/ClassBanner";
import { ClassPrerequisitesQueue } from "../classes/ClassPrerequisitesQueue";
import { ClassActivityCard } from "../classes/ClassActivityCard";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { StudentInfoBox } from "./StudentInfoBox";
import { StudentDetailsCard } from "./StudentDetailsCard";
import { StudentDocumentsCard } from "./StudentDocumentsCard";
import { StudentClassesSection } from "./StudentClassesSection";
import {
  activityForStudent,
  documentsForStudent,
  pastDueInvoicesForStudent,
  pendingPrereqsForStudent,
} from "./studentData";
import type { StudentRecord } from "./types";

const OVERVIEW_GRID = {
  columns: 24,
  left: 17,
  right: 7,
  gap: 24,
} as const;

export type StudentOverviewPageProps = {
  student: StudentRecord;
  onEditDetails?: () => void;
};

export function StudentOverviewPage({ student, onEditDetails }: StudentOverviewPageProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const submissions = pendingPrereqsForStudent(student.id);
  const pastDue = pastDueInvoicesForStudent(student.id);
  const documents = documentsForStudent(student.id);
  const activity = activityForStudent(student.id);

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
        <StudentClassesSection studentId={student.id} />
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
        <StudentDetailsCard student={student} onEditDetails={onEditDetails} />
        <StudentDocumentsCard documents={documents} />
        <ClassActivityCard items={activity} />
      </div>
    </div>
  );
}
