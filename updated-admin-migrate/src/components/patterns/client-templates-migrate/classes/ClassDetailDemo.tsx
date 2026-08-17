"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SponsorshipWithParent } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import {
  InvoicingSponsorshipsPage,
  SponsorshipDetailPanel,
} from "@/components/patterns/client-templates-migrate/invoicing";
import { ClassOverviewPage } from "./ClassOverviewPage";
import { ClassSettingsPage } from "./ClassSettingsPage";
import { classDetailFor, classRosterFor } from "./classMocks";

type ClassDetailView = "overview" | "students" | "settings";

const VIEW_LABELS: Record<Exclude<ClassDetailView, "overview">, string> = {
  students: "Students",
  settings: "Settings",
};

export type ClassDetailDemoProps = {
  classId: string;
};

/**
 * Class detail — Overview / Students / Settings, mirroring EventDetailDemo's
 * shell. Students embeds the same Sponsorships table as the standalone
 * Students page (unfiltered for now — will scope to this class later),
 * not the standalone page's full toolbar/tabs chrome.
 */
export function ClassDetailDemo({ classId }: ClassDetailDemoProps) {
  const router = useRouter();
  const classDetail = classDetailFor(classId);
  const roster = classRosterFor(classId);

  const [view, setView] = useState<ClassDetailView>("overview");
  const [selected, setSelected] = useState<SponsorshipWithParent | null>(null);

  function changeView(next: ClassDetailView) {
    setView(next);
    setSelected(null);
  }

  const topbarTitle = view === "overview" ? classDetail.title : VIEW_LABELS[view];

  const body =
    view === "students" ? (
      <div style={{ height: "100%", minHeight: 0 }}>
        <InvoicingSponsorshipsPage
          search=""
          statusFilter={[]}
          parentTypeFilter={[]}
          onSelectSponsorship={setSelected}
        />
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
    </div>
  );
}
