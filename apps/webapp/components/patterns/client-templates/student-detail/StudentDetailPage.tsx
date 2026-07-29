"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { StudentInfoBox } from "./StudentInfoBox";
import { ClassesSection } from "./ClassesSection";
import { PrerequisitesSection } from "./PrerequisitesSection";
import { InvoicesSection } from "./InvoicesSection";
import {
  sampleStudentPrerequisites,
  type StudentClassRow,
  type StudentInvoiceRow,
  type StudentPrerequisiteRow,
  type StudentSummary,
} from "@/data/mocks/student-detail";

export type StudentDetailPageProps = {
  summary: StudentSummary;
  onSelectClass?: (row: StudentClassRow) => void;
  onSelectInvoice?: (row: StudentInvoiceRow) => void;
  onReviewDocument?: (row: StudentPrerequisiteRow) => void;
  onGoToPayments?: () => void;
};

/**
 * Student Detail Overview: info box, then Prerequisites / Payments / Classes
 * sections stacked top to bottom. The Payments and Classes view tabs jump
 * to the same data as dedicated full-width pages (`InvoicesPage` /
 * `ClassesPage`) — this Overview keeps the inline sections too.
 */
export function StudentDetailPage({
  summary,
  onSelectClass,
  onSelectInvoice,
  onReviewDocument,
  onGoToPayments,
}: StudentDetailPageProps) {
  return (
    <ClassContentPage>
      <StudentInfoBox summary={summary} />
      <PrerequisitesSection
        documents={sampleStudentPrerequisites}
        onReviewDocument={onReviewDocument}
      />
      <InvoicesSection onSelectInvoice={onSelectInvoice} onGoToPayments={onGoToPayments} />
      <ClassesSection onSelectClass={onSelectClass} />
    </ClassContentPage>
  );
}
