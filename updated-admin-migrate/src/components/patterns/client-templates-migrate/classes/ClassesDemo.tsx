"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Text } from "@/components/patterns/primitives/Text";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import {
  allClassDetails,
  catalogKindForClass,
  classDetailHref,
  classHasDetailRoute,
  splitClassesByStatus,
  type CatalogTemplateKind,
} from "../catalog/catalogMocks";
import { ClassesTable } from "./ClassesTable";
import type { ClassDetail } from "./classMocks";
import type { ClassesView } from "./types";

const KIND_OPTIONS: { value: CatalogTemplateKind; label: string }[] = [
  { value: "Program", label: "Program" },
  { value: "Course", label: "Course" },
];

function viewFromPath(pathname: string, root: string): ClassesView {
  if (pathname === `${root}/open` || pathname.startsWith(`${root}/open/`)) {
    return "open";
  }
  if (pathname === `${root}/closed` || pathname.startsWith(`${root}/closed/`)) {
    return "closed";
  }
  return "all";
}

function hrefForView(root: string, view: ClassesView): string {
  return view === "all" ? root : `${root}/${view}`;
}

function matchesSearch(row: ClassDetail, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    row.title.toLowerCase().includes(q) ||
    row.classCode.toLowerCase().includes(q) ||
    row.courseCode.toLowerCase().includes(q) ||
    (row.template?.name.toLowerCase().includes(q) ?? false)
  );
}

function matchesKindFilter(row: ClassDetail, selected: string[]): boolean {
  if (!selected.length) return true;
  return selected.includes(catalogKindForClass(row));
}

/**
 * All classes: name, dates, and enrolled.
 * Open / Closed tabs split by class end date; the filter next to search is Program vs Course.
 */
export function ClassesDemo() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useAdminBasePath();
  const root = `${basePath}/classes`;
  const view = viewFromPath(pathname ?? "", root);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string[]>([]);

  function changeView(next: ClassesView) {
    router.push(hrefForView(root, next));
  }

  function selectClass(row: ClassDetail) {
    if (classHasDetailRoute(row.id)) {
      router.push(`${basePath}${classDetailHref(row.id)}`);
      return;
    }
    toast.info("Demo mode — no detail page for this class");
  }

  const filtered = useMemo(() => {
    const all = allClassDetails().filter(
      (row) => matchesKindFilter(row, kindFilter) && matchesSearch(row, search),
    );
    if (view === "all") return all;
    const { open, past } = splitClassesByStatus(all);
    return view === "open" ? open : past;
  }, [view, search, kindFilter]);

  const emptyLabel =
    view === "open"
      ? "No open classes match the current filters."
      : view === "closed"
        ? "No closed classes match the current filters."
        : "No classes match the current filters.";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "All Classes" }}
            controls={
              <ViewTabs
                aria-label="Classes views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search classes…"
                    filterGroups={[
                      {
                        label: "Type",
                        options: KIND_OPTIONS,
                        selected: kindFilter,
                        onChange: setKindFilter,
                      },
                    ]}
                  />
                }
              >
                <ViewTab label="All" selected={view === "all"} onClick={() => changeView("all")} />
                <ViewTab
                  label="Open classes"
                  selected={view === "open"}
                  onClick={() => changeView("open")}
                />
                <ViewTab
                  label="Closed classes"
                  selected={view === "closed"}
                  onClick={() => changeView("closed")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {filtered.length ? (
          <ClassesTable data={filtered} onSelect={selectClass} />
        ) : (
          <div style={{ padding: 24 }}>
            <Text color="secondary">{emptyLabel}</Text>
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}
