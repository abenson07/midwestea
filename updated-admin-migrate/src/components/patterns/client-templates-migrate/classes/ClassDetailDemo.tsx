"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAllSponsorships, useDemoGuard, type SponsorshipWithParent } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import {
  InvoicingSponsorshipsPage,
  SponsorshipDetailPanel,
  CreateSponsorshipModal,
} from "@/components/patterns/client-templates-migrate/invoicing";
import { ClassOverviewPage } from "./ClassOverviewPage";
import { ClassSettingsPage } from "./ClassSettingsPage";
import { classDetailFor, classRosterFor } from "./classMocks";

type ClassDetailView = "overview" | "students" | "settings";
type StudentsSubview = "all" | "current" | "past-due";

const VIEW_LABELS: Record<Exclude<ClassDetailView, "overview">, string> = {
  students: "Students",
  settings: "Settings",
};

const SPONSORSHIP_STATUS_OPTIONS = [
  { value: "pledged", label: "Pledged" },
  { value: "invoiced", label: "Invoiced" },
  { value: "paid", label: "Paid" },
];

const PARENT_TYPE_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "leaflet", label: "Leaflet" },
];

export type ClassDetailDemoProps = {
  classId: string;
};

/**
 * Class detail — Overview / Students / Settings, mirroring EventDetailDemo's
 * shell. Students reuses the same Sponsorships table as the standalone
 * Students page (unfiltered for now — will scope to this class later).
 */
export function ClassDetailDemo({ classId }: ClassDetailDemoProps) {
  const router = useRouter();
  const classDetail = classDetailFor(classId);
  const roster = classRosterFor(classId);

  const { enabled: demo } = useDemoGuard();
  const { createSponsorship, refetch } = useAllSponsorships();

  const [view, setView] = useState<ClassDetailView>("overview");
  const [studentsSubview, setStudentsSubview] = useState<StudentsSubview>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [parentTypeFilter, setParentTypeFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<SponsorshipWithParent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function guardedCreateSponsorship(...args: Parameters<typeof createSponsorship>) {
    if (demo) {
      const { newDemoId, upsertDemoEntity } = await import("@/lib/demo/demoStore");
      const [payload] = args;
      upsertDemoEntity("sponsorships", {
        id: newDemoId("spon"),
        ...(payload as Record<string, unknown>),
      });
      toast.success("Sponsorship created — demo mode, saved locally only");
      return null;
    }
    return createSponsorship(...args);
  }

  function changeView(next: ClassDetailView) {
    setView(next);
    setSelected(null);
  }

  const topbarTitle = view === "overview" ? classDetail.title : VIEW_LABELS[view];

  const body =
    view === "students" ? (
      <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "12px 8px",
            flexShrink: 0,
          }}
        >
          <ViewTabs aria-label="Students views">
            <ViewTab
              label="All"
              selected={studentsSubview === "all"}
              onClick={() => setStudentsSubview("all")}
            />
            <ViewTab
              label="Current"
              selected={studentsSubview === "current"}
              onClick={() => setStudentsSubview("current")}
            />
            <ViewTab
              label="Past Due"
              selected={studentsSubview === "past-due"}
              onClick={() => setStudentsSubview("past-due")}
            />
          </ViewTabs>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search sponsorships…"
              filterGroups={[
                {
                  label: "Status",
                  options: SPONSORSHIP_STATUS_OPTIONS,
                  selected: statusFilter,
                  onChange: setStatusFilter,
                },
                {
                  label: "Parent type",
                  options: PARENT_TYPE_OPTIONS,
                  selected: parentTypeFilter,
                  onChange: setParentTypeFilter,
                },
              ]}
            />
            <Button
              label="New Sponsorship"
              variant="secondary"
              icon={<Plus size={14} strokeWidth={1.75} />}
              onClick={() => setIsCreateOpen(true)}
            />
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <InvoicingSponsorshipsPage
            search={search}
            statusFilter={statusFilter}
            parentTypeFilter={parentTypeFilter}
            onSelectSponsorship={setSelected}
          />
        </div>
      </div>
    ) : view === "settings" ? (
      <ClassSettingsPage classDetail={classDetail} />
    ) : (
      <ClassOverviewPage classDetail={classDetail} roster={roster} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={view === "overview" ? 1200 : undefined}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <OutlinedPanel onClose={() => setSelected(null)}>
              <SponsorshipDetailPanel sponsorship={selected} />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: topbarTitle,
              breadcrumbs:
                view === "overview"
                  ? [{ label: "Classes", onClick: () => router.push("/admin-preview/classes") }]
                  : [
                      { label: "Classes", onClick: () => router.push("/admin-preview/classes") },
                      { label: classDetail.title, onClick: () => changeView("overview") },
                    ],
              titleAdornment:
                view === "overview" ? (
                  <Badge label={classDetail.publishStatus === "draft" ? "Draft" : classDetail.type} />
                ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Class views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Students"
                  selected={view === "students"}
                  onClick={() => changeView("students")}
                />
                <ViewTab
                  label="Settings"
                  selected={view === "settings"}
                  onClick={() => changeView("settings")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <CreateSponsorshipModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await refetch();
        }}
        createSponsorship={guardedCreateSponsorship}
      />
    </div>
  );
}
