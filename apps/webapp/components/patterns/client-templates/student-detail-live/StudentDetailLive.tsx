"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel, ComingSoon } from "@/components/patterns/client-templates/shared";
import {
  StudentStatusPill,
  ClassDetailPanel,
  InvoiceDetailPanel,
} from "@/components/patterns/client-templates/student-detail";
import { StudentDetailPageLive } from "./StudentDetailPageLive";
import { ClassesPageLive } from "./ClassesPageLive";
import { InvoicesPageLive } from "./InvoicesPageLive";
import { getStudentDetailData, type StudentDetailData } from "@/lib/students-live";
import type { StudentClassRow, StudentInvoiceRow } from "@/data/mocks/student-detail";

type StudentDetailView = "overview" | "payments" | "classes" | "documents";

type Selection =
  | { kind: "class"; row: StudentClassRow }
  | { kind: "invoice"; row: StudentInvoiceRow }
  | null;

export function StudentDetailLive() {
  const params = useParams();
  const studentId = params?.studentId as string;

  const [view, setView] = useState<StudentDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: detail, error: detailError } = await getStudentDetailData(studentId);
      if (cancelled) return;
      if (detailError) setError(detailError);
      else if (detail) setData(detail);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  function changeView(next: StudentDetailView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "payments" || view === "classes" || view === "documents";

  const body = loading ? (
    <div style={{ padding: 24, color: "var(--linear-color-ink-subtle)" }}>Loading student…</div>
  ) : error || !data ? (
    <div style={{ padding: 24, color: "var(--linear-color-danger, #eb5757)" }}>{error || "Student not found"}</div>
  ) : view === "payments" ? (
    <InvoicesPageLive data={data.invoices} onSelectInvoice={(row) => setSelection({ kind: "invoice", row })} />
  ) : view === "classes" ? (
    <ClassesPageLive data={data.classes} onSelectClass={(row) => setSelection({ kind: "class", row })} />
  ) : view === "documents" ? (
    <ComingSoon label="Documents" fullPage />
  ) : (
    <StudentDetailPageLive
      summary={data.summary}
      classes={data.classes}
      invoices={data.invoices}
      onSelectClass={(row) => setSelection({ kind: "class", row })}
      onSelectInvoice={(row) => setSelection({ kind: "invoice", row })}
      onGoToPayments={() => changeView("payments")}
    />
  );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<MigrateSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "class" ? (
                <ClassDetailPanel classRow={selection.row} />
              ) : (
                <InvoiceDetailPanel invoice={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: data?.summary.name ?? "Student",
              titleAdornment: data ? <StudentStatusPill status={data.summary.status} /> : undefined,
            }}
            controls={
              <ViewTabs aria-label="Student views">
                <ViewTab label="Overview" selected={view === "overview"} onClick={() => changeView("overview")} />
                <ViewTab label="Payments" selected={view === "payments"} onClick={() => changeView("payments")} />
                <ViewTab label="Classes" selected={view === "classes"} onClick={() => changeView("classes")} />
                <ViewTab label="Documents" selected={view === "documents"} onClick={() => changeView("documents")} />
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
