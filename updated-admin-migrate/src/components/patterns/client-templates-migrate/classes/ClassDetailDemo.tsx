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
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { ClassOverviewPage } from "./ClassOverviewPage";
import { ClassSettingsPage } from "./ClassSettingsPage";
import { ClassMessageAllModal } from "./ClassMessageAllModal";
import { classDetailFor, classRosterFor } from "./classMocks";

type ClassDetailView = "overview" | "settings";

export type ClassDetailDemoProps = {
  classId: string;
};

function viewFromPath(pathname: string, classRoot: string): ClassDetailView {
  if (pathname === `${classRoot}/settings` || pathname.startsWith(`${classRoot}/settings/`)) {
    return "settings";
  }
  return "overview";
}

function hrefForView(classRoot: string, view: ClassDetailView): string {
  return view === "overview" ? classRoot : `${classRoot}/${view}`;
}

/**
 * Class detail — overview by default. Edit on class details opens Settings;
 * Settings uses the controls strip for “Back to Class”.
 */
export function ClassDetailDemo({ classId }: ClassDetailDemoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useAdminBasePath();
  const classRoot = `${basePath}/${classId}`;
  const classDetail = classDetailFor(classId);
  const roster = classRosterFor(classId);

  const view = viewFromPath(pathname ?? "", classRoot);
  const [messageOpen, setMessageOpen] = useState(false);

  function changeView(next: ClassDetailView) {
    router.push(hrefForView(classRoot, next));
  }

  const topbarTitle = view === "overview" ? classDetail.title : "Settings";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={view === "overview" ? 1200 : undefined}
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
                <Button
                  label="Message all students"
                  variant="secondary"
                  icon={<Mail size={14} strokeWidth={1.75} />}
                  onClick={() => setMessageOpen(true)}
                />
              ),
            }}
            isControlsVisible={view === "settings"}
            controls={
              view === "settings" ? (
                <ViewTabs aria-label="Class settings">
                  <ViewTab label="Back to Class" onClick={() => changeView("overview")} />
                </ViewTabs>
              ) : undefined
            }
          />
        }
      >
        {view === "settings" ? (
          <ClassSettingsPage classDetail={classDetail} />
        ) : (
          <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
            <ClassOverviewPage
              classDetail={classDetail}
              roster={roster}
              onEditDetails={() => changeView("settings")}
            />
          </div>
        )}
      </FoundationLayout>
      <ClassMessageAllModal isOpen={messageOpen} onClose={() => setMessageOpen(false)} />
    </div>
  );
}
