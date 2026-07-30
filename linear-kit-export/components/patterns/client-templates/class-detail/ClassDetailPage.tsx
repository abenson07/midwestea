"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ClassInfoBox } from "./ClassInfoBox";
import { StudentsSection } from "./StudentsSection";
import { PrerequisitesSection } from "./PrerequisitesSection";
import { InvoicesSection } from "./InvoicesSection";
import {
  sampleClassPrerequisites,
  sampleClassSummary,
  type ClassInvoiceRow,
  type ClassPrerequisiteRow,
  type ClassStudentRow,
} from "@/data/mocks/class-detail";

export type ClassDetailPageProps = {
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
  onSelectStudent,
  onSelectInvoice,
  onReviewDocument,
}: ClassDetailPageProps) {
  return (
    <ClassContentPage>
      <ClassInfoBox summary={sampleClassSummary} />
      <StudentsSection onSelectStudent={onSelectStudent} />
      <PrerequisitesSection
        documents={sampleClassPrerequisites}
        onReviewDocument={onReviewDocument}
      />
      <InvoicesSection onSelectInvoice={onSelectInvoice} />
    </ClassContentPage>
  );
}
