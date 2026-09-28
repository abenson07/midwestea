"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/admin-migrate/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/admin-migrate/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/admin-migrate/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/admin-migrate/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/admin-migrate/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/admin-migrate/patterns/foundation/ListToolbar";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { STUDENT_ROWS } from "./studentData";
import { StudentsTable } from "./StudentsTable";
import { matchesStudentsView, type StudentRow, type StudentsView } from "./types";

function viewFromPath(pathname: string, root: string): StudentsView {
  if (pathname === `${root}/current` || pathname.startsWith(`${root}/current/`)) {
    return "current";
  }
  if (pathname === `${root}/past-due` || pathname.startsWith(`${root}/past-due/`)) {
    return "past-due";
  }
  return "all";
}

function hrefForView(root: string, view: StudentsView): string {
  return view === "all" ? root : `${root}/${view}`;
}

function matchesSearch(row: StudentRow, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    row.name.toLowerCase().includes(q) ||
    row.email.toLowerCase().includes(q) ||
    row.classes.some((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
  );
}

export type StudentsDemoProps = {
  /** When omitted, the roster stays on demo mocks (`/admin-preview`). */
  rows?: StudentRow[];
};

/**
 * Students roster: name, email, classes, payment status, and first enrolled.
 * Current filters to enrolled students; Past due to enrolled students with a past-due invoice.
 */
export function StudentsDemo({ rows: rowsProp }: StudentsDemoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const rows = rowsProp ?? (live ? [] : STUDENT_ROWS);
  const root = `${basePath}/students`;
  const view = viewFromPath(pathname ?? "", root);
  const [search, setSearch] = useState("");

  function changeView(next: StudentsView) {
    router.push(hrefForView(root, next));
  }

  const filtered = useMemo(
    () => rows.filter((row) => matchesStudentsView(row, view) && matchesSearch(row, search)),
    [rows, view, search],
  );

  const noun = view === "current" ? "currently enrolled students" : view === "past-due" ? "past due students" : "students";
  const emptyLabel = search ? `No ${noun} match "${search}".` : `No ${noun} yet.`;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Students" }}
            controls={
              <ViewTabs
                aria-label="Students views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search students…"
                  />
                }
              >
                <ViewTab label="All" selected={view === "all"} onClick={() => changeView("all")} />
                <ViewTab
                  label="Current"
                  selected={view === "current"}
                  onClick={() => changeView("current")}
                />
                <ViewTab
                  label="Past Due"
                  selected={view === "past-due"}
                  onClick={() => changeView("past-due")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {filtered.length ? (
          <StudentsTable data={filtered} onSelect={(id) => router.push(`${root}/${id}`)} />
        ) : (
          <div style={{ padding: 24 }}>
            <Text color="secondary">{emptyLabel}</Text>
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}
