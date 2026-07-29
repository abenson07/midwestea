"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { StudentDetailPage } from "./StudentDetailPage";
import { StudentStatusPill } from "./StudentStatusPill";
import { ClassesPage } from "./ClassesPage";
import { InvoicesPage } from "./InvoicesPage";
import { DocumentsPage } from "./DocumentsPage";
import { ClassDetailPanel } from "./ClassDetailPanel";
import { InvoiceDetailPanel } from "./InvoiceDetailPanel";
import { DocumentDetailPanel } from "./DocumentDetailPanel";
import {
  sampleStudentSummary,
  type StudentCertificateRow,
  type StudentClassRow,
  type StudentDocumentRow,
  type StudentInvoiceRow,
} from "@/data/mocks/student-detail";

type StudentDetailView = "overview" | "payments" | "classes" | "documents";

type Selection =
  | { kind: "class"; row: StudentClassRow }
  | { kind: "invoice"; row: StudentInvoiceRow }
  | { kind: "document"; row: StudentCertificateRow | StudentDocumentRow }
  | null;

export function StudentDetailDemo() {
  const [view, setView] = useState<StudentDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);

  function changeView(next: StudentDetailView) {
    setView(next);
    setSelection(null);
  }

  function selectClass(row: StudentClassRow) {
    setSelection({ kind: "class", row });
  }

  function selectInvoice(row: StudentInvoiceRow) {
    setSelection({ kind: "invoice", row });
  }

  function selectDocument(row: StudentCertificateRow | StudentDocumentRow) {
    setSelection({ kind: "document", row });
  }

  const isFullBleed = view === "payments" || view === "classes" || view === "documents";

  const body =
    view === "payments" ? (
      <InvoicesPage onSelectInvoice={selectInvoice} />
    ) : view === "classes" ? (
      <ClassesPage onSelectClass={selectClass} />
    ) : view === "documents" ? (
      <DocumentsPage onSelectCertificate={selectDocument} onSelectDocument={selectDocument} />
    ) : (
      <StudentDetailPage
        summary={sampleStudentSummary}
        onSelectClass={selectClass}
        onSelectInvoice={selectInvoice}
        onGoToPayments={() => changeView("payments")}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "class" ? (
                <ClassDetailPanel classRow={selection.row} />
              ) : selection.kind === "invoice" ? (
                <InvoiceDetailPanel invoice={selection.row} />
              ) : (
                <DocumentDetailPanel document={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: sampleStudentSummary.name,
              titleAdornment: <StudentStatusPill status={sampleStudentSummary.status} />,
            }}
            controls={
              <ViewTabs aria-label="Student views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Payments"
                  selected={view === "payments"}
                  onClick={() => changeView("payments")}
                />
                <ViewTab
                  label="Classes"
                  selected={view === "classes"}
                  onClick={() => changeView("classes")}
                />
                <ViewTab
                  label="Documents"
                  selected={view === "documents"}
                  onClick={() => changeView("documents")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
    </div>
  );
}
