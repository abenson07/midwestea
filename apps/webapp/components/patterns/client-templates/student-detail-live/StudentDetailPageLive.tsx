"use client";

import { ClassContentPage, ComingSoon } from "@/components/patterns/client-templates/shared";
import { StudentInfoBox } from "@/components/patterns/client-templates/student-detail";
import { ClassesSectionLive } from "./ClassesSectionLive";
import { InvoicesSectionLive } from "./InvoicesSectionLive";
import type {
  StudentClassRow,
  StudentInvoiceRow,
  StudentSummary,
} from "@/data/mocks/student-detail";

export type StudentDetailPageLiveProps = {
  summary: StudentSummary;
  classes: StudentClassRow[];
  invoices: StudentInvoiceRow[];
  onSelectClass?: (row: StudentClassRow) => void;
  onSelectInvoice?: (row: StudentInvoiceRow) => void;
  onGoToPayments?: () => void;
};

/**
 * Real-data Student Detail overview: info box, then Prerequisites (coming
 * soon — not wired up yet) / Payments / Classes sections.
 */
export function StudentDetailPageLive({
  summary,
  classes,
  invoices,
  onSelectClass,
  onSelectInvoice,
  onGoToPayments,
}: StudentDetailPageLiveProps) {
  return (
    <ClassContentPage>
      <StudentInfoBox summary={summary} />
      <ComingSoon label="Prerequisites" />
      <InvoicesSectionLive data={invoices} onSelectInvoice={onSelectInvoice} onGoToPayments={onGoToPayments} />
      <ClassesSectionLive data={classes} onSelectClass={onSelectClass} />
    </ClassContentPage>
  );
}
