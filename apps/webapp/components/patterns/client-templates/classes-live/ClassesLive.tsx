"use client";

import { useEffect, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { OnlineClassPanel, ClassSummaryPanel } from "@/components/patterns/client-templates/classes";
import { ClassesOverviewLive } from "./ClassesOverviewLive";
import { ActiveClassesFullTableLive } from "./ProgramClassesTableLive";
import { getClasses } from "@/lib/classes";
import { getEnrollmentCountsByClassId, bucketClasses, type BucketedClasses } from "@/lib/classes-live";
import type { OnlineClassRow, OtherClassRow } from "@/data/mocks/classes";

type ClassesView = "overview" | "active";

type Panel =
  | { kind: "online"; row: OnlineClassRow }
  | { kind: "other"; row: OtherClassRow }
  | null;

const emptyBuckets: BucketedClasses = { programClasses: [], onlineClasses: [], otherClasses: [] };

export function ClassesLive() {
  const [view, setView] = useState<ClassesView>("overview");
  const [panel, setPanel] = useState<Panel>(null);
  const [buckets, setBuckets] = useState<BucketedClasses>(emptyBuckets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [{ classes, error: classesError }, { counts, error: countsError }] = await Promise.all([
        getClasses(),
        getEnrollmentCountsByClassId(),
      ]);

      if (cancelled) return;

      if (classesError) {
        setError(classesError);
      } else if (classes) {
        setBuckets(bucketClasses(classes, counts ?? {}));
      }
      if (countsError) {
        console.error("Error fetching enrollment counts:", countsError);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleToggleOnlineClass(row: OnlineClassRow, next: boolean) {
    const confirmed = window.confirm(
      `${next ? "Enable" : "Disable"} "${row.name}"? Students will ${
        next ? "be able to" : "no longer be able to"
      } purchase this class.`,
    );
    if (!confirmed) return;
    setBuckets((prev) => ({
      ...prev,
      onlineClasses: prev.onlineClasses.map((item) =>
        item.id === row.id ? { ...item, isEnabled: next } : item,
      ),
    }));
  }

  const isFullBleed = view === "active";

  const body = loading ? (
    <div style={{ padding: 24, color: "var(--linear-color-ink-subtle)" }}>Loading classes…</div>
  ) : error ? (
    <div style={{ padding: 24, color: "var(--linear-color-danger, #eb5757)" }}>{error}</div>
  ) : view === "active" ? (
    <ActiveClassesFullTableLive data={buckets.programClasses} />
  ) : (
    <ClassesOverviewLive
      programClasses={buckets.programClasses}
      onlineClasses={buckets.onlineClasses}
      otherClasses={buckets.otherClasses}
      onToggleOnlineClass={handleToggleOnlineClass}
      onSelectOnlineClass={(row) => setPanel({ kind: "online", row })}
      onSelectOtherClass={(row) => setPanel({ kind: "other", row })}
    />
  );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<MigrateSidebar />}
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
