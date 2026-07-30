"use client";

import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { OnlineClassDetailPage } from "./OnlineClassDetailPage";
import { ClassStatusPill } from "./ClassStatusPill";
import { EditOnlineClassPanel } from "./EditOnlineClassPanel";
import { AllStudentsPage } from "./AllStudentsPage";
import { StudentDetailPanel } from "./StudentDetailPanel";
import {
  sampleOnlineClassSummary,
  type OnlineClassStudentRow,
} from "@/data/mocks/online-class-detail";

type OnlineClassDetailView = "overview" | "students";

export type OnlineClassDetailDemoProps = {
  navigation?: ReactNode;
};

export function OnlineClassDetailDemo({ navigation }: OnlineClassDetailDemoProps = {}) {
  const [view, setView] = useState<OnlineClassDetailView>("overview");
  const [selectedStudent, setSelectedStudent] = useState<OnlineClassStudentRow | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classSummary, setClassSummary] = useState(sampleOnlineClassSummary);

  function changeView(next: OnlineClassDetailView) {
    setView(next);
    setSelectedStudent(null);
  }

  function selectStudent(row: OnlineClassStudentRow) {
    setIsEditingClass(false);
    setSelectedStudent(row);
  }

  const isFullBleed = view === "students";

  const body =
    view === "students" ? (
      <AllStudentsPage onSelectStudent={selectStudent} />
    ) : (
      <OnlineClassDetailPage summary={classSummary} onSelectStudent={selectStudent} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={isEditingClass || selectedStudent != null}
        sideContent={
          isEditingClass ? (
            <OutlinedPanel onClose={() => setIsEditingClass(false)}>
              <EditOnlineClassPanel
                summary={classSummary}
                onSave={(next) => {
                  setClassSummary(next);
                  setIsEditingClass(false);
                }}
              />
            </OutlinedPanel>
          ) : selectedStudent ? (
            <OutlinedPanel onClose={() => setSelectedStudent(null)}>
              <StudentDetailPanel student={selectedStudent} />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: classSummary.name,
              titleAdornment: <ClassStatusPill status={classSummary.status} />,
              hasFavorite: true,
              hasMore: true,
              moreMenu: (
                <Dropdown
                  label="Class actions"
                  open={isMoreOpen}
                  onOpenChange={setIsMoreOpen}
                  placement="below"
                  alignment="end"
                  trigger={
                    <IconButton
                      label="More actions"
                      variant="ghost"
                      size="sm"
                      icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                      isActive={isMoreOpen}
                    />
                  }
                >
                  <DropdownItem
                    label="Edit class"
                    onSelect={() => {
                      setIsMoreOpen(false);
                      setSelectedStudent(null);
                      setIsEditingClass(true);
                    }}
                  />
                  <DropdownSeparator />
                  <DropdownItem
                    label="Close enrollment"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                  <DropdownItem
                    label="Close class"
                    onSelect={() => setIsMoreOpen(false)}
                  />
                </Dropdown>
              ),
            }}
            controls={
              <ViewTabs aria-label="Class views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="All Students"
                  selected={view === "students"}
                  onClick={() => changeView("students")}
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
