"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { ClassesOverviewPage } from "./ClassesOverviewPage";
import { ActiveClassesFullTable } from "./ProgramClassesTable";
import { OnlineClassPanel } from "./OnlineClassPanel";
import { ClassSummaryPanel } from "./ClassSummaryPanel";
import {
  sampleOnlineClasses,
  type OnlineClassRow,
  type OtherClassRow,
} from "@/data/mocks/classes";

type ClassesView = "overview" | "active";

type Panel =
  | { kind: "online"; row: OnlineClassRow }
  | { kind: "other"; row: OtherClassRow }
  | null;

export function ClassesDemo() {
  const [view, setView] = useState<ClassesView>("overview");
  const [onlineClasses, setOnlineClasses] = useState(sampleOnlineClasses);
  const [panel, setPanel] = useState<Panel>(null);

  function handleToggleOnlineClass(row: OnlineClassRow, next: boolean) {
    const confirmed = window.confirm(
      `${next ? "Enable" : "Disable"} "${row.name}"? Students will ${
        next ? "be able to" : "no longer be able to"
      } purchase this class.`,
    );
    if (!confirmed) return;
    setOnlineClasses((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, isEnabled: next } : item)),
    );
  }

  const isFullBleed = view === "active";

  const body =
    view === "active" ? (
      <ActiveClassesFullTable />
    ) : (
      <ClassesOverviewPage
        onlineClasses={onlineClasses}
        onToggleOnlineClass={handleToggleOnlineClass}
        onSelectOnlineClass={(row) => setPanel({ kind: "online", row })}
        onSelectOtherClass={(row) => setPanel({ kind: "other", row })}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={panel != null}
        sideContent={
          panel ? (
            <OutlinedPanel onClose={() => setPanel(null)}>
              {panel.kind === "online" ? (
                <OnlineClassPanel onlineClass={panel.row} />
              ) : (
                <ClassSummaryPanel otherClass={panel.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{ title: "Classes" }}
            controls={
              <ViewTabs aria-label="Classes views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => {
                    setView("overview");
                    setPanel(null);
                  }}
                />
                <ViewTab
                  label="Active Classes"
                  selected={view === "active"}
                  onClick={() => {
                    setView("active");
                    setPanel(null);
                  }}
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
