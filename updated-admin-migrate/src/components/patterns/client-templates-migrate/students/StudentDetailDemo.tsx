"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { StudentOverviewPage } from "./StudentOverviewPage";
import { StudentSettingsPage } from "./StudentSettingsPage";
import { StudentInvoicesPage } from "./StudentInvoicesPage";
import { StudentPrerequisiteSubmissionsPage } from "./StudentPrerequisiteSubmissionsPage";
import { StudentMessageModal } from "./StudentMessageModal";
import { studentById, studentPrerequisiteSubmissionRows } from "./studentData";
import type { StudentEnrollment, StudentRecord } from "./types";
import { TransactionRowsProvider } from "../payments/useTransactions";
import type { TransactionRow } from "@/data/mocks/transactions";
import type { ClassDetail } from "../classes/classMocks";

type StudentDetailView = "overview" | "settings" | "invoices" | "prerequisites";

export type StudentDetailDemoProps = {
  studentId: string;
  /** When omitted, the profile stays on demo mocks (`/admin-preview`). */
  student?: StudentRecord;
  enrollments?: StudentEnrollment[];
  classDetails?: ClassDetail[];
  transactions?: TransactionRow[];
};

function viewFromPath(pathname: string, studentRoot: string): StudentDetailView {
  if (pathname === `${studentRoot}/settings` || pathname.startsWith(`${studentRoot}/settings/`)) {
    return "settings";
  }
  if (pathname === `${studentRoot}/invoices` || pathname.startsWith(`${studentRoot}/invoices/`)) {
    return "invoices";
  }
  if (
    pathname === `${studentRoot}/prerequisites` ||
    pathname.startsWith(`${studentRoot}/prerequisites/`)
  ) {
    return "prerequisites";
  }
  return "overview";
}

function hrefForView(studentRoot: string, view: StudentDetailView): string {
  return view === "overview" ? studentRoot : `${studentRoot}/${view}`;
}

/**
 * Student profile — overview by default. Edit on personal details opens Settings.
 */
export function StudentDetailDemo({
  studentId,
  student: studentProp,
  enrollments,
  classDetails,
  transactions,
}: StudentDetailDemoProps) {
  const live = useIsNewAdminMigrate();
  const inner = (
    <StudentDetailDemoInner
      studentId={studentId}
      student={studentProp}
      enrollments={enrollments}
      classDetails={classDetails}
    />
  );
  if (transactions || live) {
    return <TransactionRowsProvider rows={transactions ?? []}>{inner}</TransactionRowsProvider>;
  }
  return inner;
}

function StudentDetailDemoInner({
  studentId,
  student: studentProp,
  enrollments,
  classDetails,
}: Omit<StudentDetailDemoProps, "transactions">) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const studentRoot = `${basePath}/students/${studentId}`;
  const student = studentProp ?? (live ? undefined : studentById(studentId));
  const view = viewFromPath(pathname ?? "", studentRoot);
  const [messageOpen, setMessageOpen] = useState(false);

  function changeView(next: StudentDetailView) {
    router.push(hrefForView(studentRoot, next));
  }

  if (!student) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          header={
            <CanvasHeader
              topbar={{
                title: "Student",
                breadcrumbs: [{ label: "Students", onClick: () => router.push(`${basePath}/students`) }],
              }}
            />
          }
        >
          <div style={{ padding: 24 }}>
            <Text color="secondary">No student matches this profile.</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  const topbarTitle =
    view === "overview"
      ? student.name
      : view === "invoices"
        ? "Invoices"
        : view === "prerequisites"
          ? "Prerequisite submissions"
          : "Settings";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={view === "settings" ? undefined : 1200}
        header={
          <CanvasHeader
            topbar={{
              title: topbarTitle,
              breadcrumbs:
                view === "overview"
                  ? [{ label: "Students", onClick: () => router.push(`${basePath}/students`) }]
                  : [
                      { label: "Students", onClick: () => router.push(`${basePath}/students`) },
                      { label: student.name, onClick: () => changeView("overview") },
                    ],
              endContent: (
                <Button
                  label="Message student"
                  variant="secondary"
                  icon={<Mail size={14} strokeWidth={1.75} />}
                  onClick={() => setMessageOpen(true)}
                />
              ),
            }}
            isControlsVisible={view !== "overview"}
            controls={
              view !== "overview" ? (
                <ViewTabs aria-label="Student settings">
                  <ViewTab label="Back to student" onClick={() => changeView("overview")} />
                </ViewTabs>
              ) : undefined
            }
          />
        }
      >
        {view === "settings" ? (
          <StudentSettingsPage
            student={student}
            onDeleted={() => router.push(`${basePath}/students`)}
          />
        ) : view === "invoices" ? (
          <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
            <StudentInvoicesPage studentId={student.id} enrollments={enrollments} />
          </div>
        ) : view === "prerequisites" ? (
          <StudentPrerequisiteSubmissionsPage
            rows={live ? [] : studentPrerequisiteSubmissionRows(student.id)}
          />
        ) : (
          <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
            <StudentOverviewPage
              student={student}
              enrollments={enrollments}
              classDetails={classDetails}
              onEditDetails={() => changeView("settings")}
            />
          </div>
        )}
      </FoundationLayout>
      <StudentMessageModal
        isOpen={messageOpen}
        studentName={student.name}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
}
