"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mail, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/admin-migrate/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/admin-migrate/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/admin-migrate/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/admin-migrate/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/admin-migrate/patterns/foundation/ViewTabs";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { formatCalendarMonthDay, todayIsoDate } from "@/lib/dates";
import { CreateClassModal } from "../catalog/CreateClassModal";
import {
  catalogTemplateByCode,
  catalogTemplateFromHref,
  catalogTemplateHref,
  classDetailHref,
  classesForTemplate,
} from "../catalog/catalogMocks";
import { ClassOverviewPage } from "./ClassOverviewPage";
import { ClassSettingsPage } from "./ClassSettingsPage";
import { ClassInvoicesPage } from "./ClassInvoicesPage";
import { ClassPrerequisitesPage } from "./ClassPrerequisitesPage";
import { ClassMessageAllModal } from "./ClassMessageAllModal";
import { ClassAddStudentModal } from "./ClassAddStudentModal";
import { RemoveStudentModal } from "./RemoveStudentModal";
import {
  classActivityFor,
  classDetailFor,
  classRosterFor,
  type ClassActivityItem,
  type ClassDetail,
  type ClassRosterRow,
  type StudentToRemove,
} from "./classMocks";
import { isClassClosed } from "./classTableColumns";
import { TransactionDetailPanel } from "../payments/TransactionDetailPanel";
import { TransactionSidePanel } from "../payments/TransactionSidePanel";
import { TransactionRowsProvider, useTransactions } from "../payments/useTransactions";
import type { TransactionRow } from "@/data/mocks/transactions";

type ClassDetailView = "overview" | "settings" | "transactions" | "prerequisites";

export type ClassDetailDemoProps = {
  classId: string;
  /** When omitted, the profile stays on demo mocks (`/admin-preview`). */
  classDetail?: ClassDetail;
  roster?: ClassRosterRow[];
  transactions?: TransactionRow[];
  locationNames?: string[];
};

function viewFromPath(pathname: string, classRoot: string): ClassDetailView {
  if (pathname === `${classRoot}/settings` || pathname.startsWith(`${classRoot}/settings/`)) {
    return "settings";
  }
  if (
    pathname === `${classRoot}/transactions` ||
    pathname.startsWith(`${classRoot}/transactions/`) ||
    pathname === `${classRoot}/payments` ||
    pathname.startsWith(`${classRoot}/payments/`)
  ) {
    return "transactions";
  }
  if (
    pathname === `${classRoot}/prerequisites` ||
    pathname.startsWith(`${classRoot}/prerequisites/`)
  ) {
    return "prerequisites";
  }
  return "overview";
}

function hrefForView(classRoot: string, view: ClassDetailView): string {
  return view === "overview" ? classRoot : `${classRoot}/${view}`;
}

function logSettingsActivity(
  prev: ClassDetail,
  next: ClassDetail,
  logActivity: (kind: ClassActivityItem["kind"], text: string) => void,
) {
  let logged = false;
  if (next.publishStatus !== prev.publishStatus) {
    logActivity(
      "publish",
      next.publishStatus === "published" ? "Published the class" : "Unpublished the class",
    );
    logged = true;
  }
  const prevPrereqs = new Set(prev.prerequisites);
  const nextPrereqs = new Set(next.prerequisites);
  for (const name of next.prerequisites) {
    if (!prevPrereqs.has(name)) {
      logActivity("update", `Added prerequisite ${name}`);
      logged = true;
    }
  }
  for (const name of prev.prerequisites) {
    if (!nextPrereqs.has(name)) {
      logActivity("update", `Removed prerequisite ${name}`);
      logged = true;
    }
  }
  const prevLinks = new Map((prev.externalLinks ?? []).map((link) => [link.id, link]));
  const nextLinks = new Map((next.externalLinks ?? []).map((link) => [link.id, link]));
  for (const link of next.externalLinks ?? []) {
    if (!prevLinks.has(link.id)) {
      logActivity("update", `Added external link ${link.name}`);
      logged = true;
    }
  }
  for (const link of prev.externalLinks ?? []) {
    if (!nextLinks.has(link.id)) {
      logActivity("update", `Removed external link ${link.name}`);
      logged = true;
    }
  }
  if (next.price !== prev.price) {
    logActivity("update", `Updated tuition to ${next.price}`);
    logged = true;
  }
  if (!logged) logActivity("update", "Updated class settings");
}

/**
 * Class detail — overview by default. Edit on class details opens Settings;
 * Settings uses the controls strip for “Back to Class”.
 */
export function ClassDetailDemo({
  classId,
  classDetail: classDetailProp,
  roster: rosterProp,
  transactions,
  locationNames,
}: ClassDetailDemoProps) {
  const live = useIsNewAdminMigrate();
  const inner = (
    <ClassDetailDemoInner
      classId={classId}
      classDetail={classDetailProp}
      roster={rosterProp}
      locationNames={locationNames}
    />
  );
  if (transactions || live) {
    return <TransactionRowsProvider rows={transactions ?? []}>{inner}</TransactionRowsProvider>;
  }
  return inner;
}

function ClassDetailDemoInner({
  classId,
  classDetail: classDetailProp,
  roster: rosterProp,
  locationNames,
}: Omit<ClassDetailDemoProps, "transactions">) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const catchAllRoot = `${basePath}/class/${classId}`;
  const classRoot =
    pathname === catchAllRoot || pathname?.startsWith(`${catchAllRoot}/`)
      ? catchAllRoot
      : `${basePath}/${classId}`;

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(
    () => classDetailProp ?? (live ? null : classDetailFor(classId)),
  );
  const [roster, setRoster] = useState<ClassRosterRow[]>(
    () => rosterProp ?? (live ? [] : classRosterFor(classId)),
  );
  const [activity, setActivity] = useState<ClassActivityItem[]>(() =>
    live ? [] : classActivityFor(classId),
  );
  const [messageOpen, setMessageOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [removeStudent, setRemoveStudent] = useState<StudentToRemove | null>(null);
  const { transactions, updateTransaction } = useTransactions();

  useEffect(() => {
    if (searchParams.get("openAddStudent") !== "1") return;
    setAddStudentOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("openAddStudent");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consume the one-shot param once per navigation, not on every searchParams identity change
  }, [searchParams]);

  if (!classDetail) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          header={
            <CanvasHeader
              topbar={{
                title: "Class",
                breadcrumbs: [{ label: "Classes", onClick: () => router.push(`${basePath}/classes`) }],
              }}
            />
          }
        >
          <div style={{ padding: 24 }}>
            <Text color="secondary">No class matches this profile.</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  const closed = isClassClosed(classDetail);
  const view = viewFromPath(pathname ?? "", classRoot);
  const selectedId = view === "transactions" ? searchParams.get("transactionId") : null;
  const selected =
    selectedId == null
      ? null
      : (transactions.find((row) => row.id === selectedId && row.classId === classId) ?? null);

  function closeTransaction() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("transactionId");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  }
  const parentTemplate =
    catalogTemplateFromHref(classDetail.template?.href) ??
    catalogTemplateByCode(classDetail.courseCode);

  function changeView(next: ClassDetailView) {
    router.push(hrefForView(classRoot, next));
  }

  function logActivity(kind: ClassActivityItem["kind"], text: string) {
    setActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        kind,
        text,
        date: formatCalendarMonthDay(todayIsoDate()),
      },
      ...prev,
    ]);
  }

  const topbarTitle =
    view === "overview"
      ? classDetail.title
      : view === "transactions"
        ? "Transactions"
        : view === "prerequisites"
          ? "Prerequisites"
          : "Settings";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={view === "settings" || view === "transactions" ? undefined : 1200}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <TransactionSidePanel onClose={closeTransaction}>
              <TransactionDetailPanel
                transaction={selected}
                context="class"
                onChange={(patch) => updateTransaction(selected.id, patch)}
              />
            </TransactionSidePanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: topbarTitle,
              breadcrumbs:
                view === "overview"
                  ? [{ label: "Classes", onClick: () => router.push(`${basePath}/classes`) }]
                  : [
                      { label: "Classes", onClick: () => router.push(`${basePath}/classes`) },
                      { label: classDetail.title, onClick: () => changeView("overview") },
                    ],
              endContent: (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    label="Add Class"
                    variant="secondary"
                    icon={<Plus size={14} strokeWidth={1.75} />}
                    onClick={() => setCreateOpen(true)}
                  />
                  {!closed ? (
                    <Button
                      label="Add Student"
                      variant="secondary"
                      icon={<UserPlus size={14} strokeWidth={1.75} />}
                      onClick={() => setAddStudentOpen(true)}
                    />
                  ) : null}
                  <Button
                    label="Message all students"
                    variant="secondary"
                    icon={<Mail size={14} strokeWidth={1.75} />}
                    onClick={() => setMessageOpen(true)}
                  />
                </div>
              ),
            }}
            isControlsVisible={view !== "overview"}
            controls={
              view !== "overview" ? (
                <ViewTabs aria-label="Class settings">
                  <ViewTab label="Back to Class" onClick={() => changeView("overview")} />
                </ViewTabs>
              ) : undefined
            }
          />
        }
      >
        {view === "settings" ? (
          <ClassSettingsPage
            classDetail={classDetail}
            locationNames={locationNames}
            onSave={(next) => {
              setClassDetail(next);
              logSettingsActivity(classDetail, next, logActivity);
            }}
            onDeleted={() => {
              router.push(
                parentTemplate ? `${basePath}${catalogTemplateHref(parentTemplate)}` : `${basePath}/classes`,
              );
            }}
          />
        ) : view === "transactions" ? (
          <ClassInvoicesPage classDetail={classDetail} />
        ) : view === "prerequisites" ? (
          <ClassPrerequisitesPage classDetail={classDetail} />
        ) : (
          <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
            <ClassOverviewPage
              classDetail={classDetail}
              roster={roster}
              activity={activity}
              onEditDetails={closed ? undefined : () => changeView("settings")}
              onAddPrerequisite={(name) => {
                setClassDetail((prev) => {
                  if (!prev || prev.prerequisites.includes(name)) return prev;
                  return { ...prev, prerequisites: [...prev.prerequisites, name] };
                });
                logActivity("update", `Added prerequisite ${name}`);
              }}
              onRemoveStudent={setRemoveStudent}
            />
          </div>
        )}
      </FoundationLayout>
      <ClassMessageAllModal isOpen={messageOpen} onClose={() => setMessageOpen(false)} />
      <ClassAddStudentModal
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        roster={roster}
        onAdd={(student) => {
          setRoster((prev) => [...prev, student]);
          logActivity("enroll", `${student.name} enrolled`);
        }}
      />
      <RemoveStudentModal
        student={removeStudent}
        onClose={() => setRemoveStudent(null)}
        onConfirm={(student, refundAmount) => {
          setRoster((prev) => prev.filter((row) => row.id !== student.id));
          setRemoveStudent(null);
          const formatted = refundAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });
          logActivity("update", `Removed ${student.name}`);
          toast.success(`Removed ${student.name} with a ${formatted} refund — demo mode`, {
            action: {
              label: "Undo",
              onClick: () => {
                setRoster((prev) =>
                  prev.some((row) => row.id === student.id)
                    ? prev
                    : [
                        ...prev,
                        {
                          id: student.id,
                          name: student.name,
                          email: student.email,
                          role: "Student",
                          status: "Enrolled",
                        },
                      ],
                );
                toast.success(`Restored ${student.name}`);
              },
            },
          });
        }}
      />
      <CreateClassModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        template={parentTemplate}
        existingClassCount={parentTemplate ? classesForTemplate(parentTemplate.code).length : 0}
        onCreated={(created) => {
          router.push(`${basePath}${classDetailHref(created.id)}`);
        }}
      />
    </div>
  );
}
