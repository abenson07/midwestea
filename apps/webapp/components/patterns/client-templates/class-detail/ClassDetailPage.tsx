"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ClassInfoBox } from "./ClassInfoBox";
import { StudentsSection } from "./StudentsSection";
import { PrerequisitesSection } from "./PrerequisitesSection";
import { InvoicesSection } from "./InvoicesSection";
import {
  sampleClassPrerequisites,
  type ClassInvoiceRow,
  type ClassPrerequisiteRow,
  type ClassStudentRow,
  type ClassSummary,
} from "@/data/mocks/class-detail";

export type ClassDetailPageProps = {
  summary: ClassSummary;
  onSelectStudent?: (row: ClassStudentRow) => void;
  onSelectInvoice?: (row: ClassInvoiceRow) => void;
  onReviewDocument?: (row: ClassPrerequisiteRow) => void;
};

/**
 * Class Detail Overview: info box, then Students / Prerequisites / Invoices
 * sections stacked top to bottom. The Students and Invoices view tabs jump
 * to the same data as dedicated full-width pages (`StudentsPage` /
 * `InvoicesPage`) — this Overview keeps the inline sections too.
 */
export function ClassDetailPage({
  summary,
  onSelectStudent,
  onSelectInvoice,
  onReviewDocument,
}: ClassDetailPageProps) {
  return (
    <ClassContentPage>
      <ClassInfoBox summary={summary} />
      <PrerequisitesSection
        documents={sampleClassPrerequisites}
        onReviewDocument={onReviewDocument}
      />
      <StudentsSection onSelectStudent={onSelectStudent} />
      <InvoicesSection onSelectInvoice={onSelectInvoice} />
    </ClassContentPage>
  );
}
