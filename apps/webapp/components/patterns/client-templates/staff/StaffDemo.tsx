"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { VStack } from "@/components/patterns/primitives/Stack";
import { StaffTable } from "./StaffTable";
import { StaffProfilePanel } from "./StaffProfilePanel";
import { StaffClassesSection } from "./StaffClassesSection";
import { StaffPermissionsSection } from "./StaffPermissionsSection";
import { AddStaffModal } from "./AddStaffModal";
import { sampleStaff, type StaffRow } from "@/data/mocks/staff";

type StaffView = "all" | "trainers" | "admins";

export type StaffDemoProps = {
  navigation?: ReactNode;
};

export function StaffDemo({ navigation }: StaffDemoProps = {}) {
  const [staff, setStaff] = useState<StaffRow[]>(sampleStaff);
  const [view, setView] = useState<StaffView>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function changeView(next: StaffView) {
    setView(next);
    setSelectedId(null);
  }

  const filteredStaff = useMemo(() => {
    if (view === "trainers") return staff.filter((row) => row.isTrainer);
    if (view === "admins") return staff.filter((row) => row.isAdmin);
    return staff;
  }, [staff, view]);

  const selected = staff.find((row) => row.id === selectedId) ?? null;

  const handleAddClass = useCallback((classCode: string) => {
    if (!selectedId) return;
    setStaff((current) =>
      current.map((row) =>
        row.id === selectedId && !row.classes.includes(classCode)
          ? { ...row, classes: [...row.classes, classCode] }
          : row,
      ),
    );
  }, [selectedId]);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        isSideContentVisible={selected != null}
        sideContent={
          selected ? (
            <OutlinedPanel onClose={() => setSelectedId(null)}>
              <VStack gap={5}>
                <StaffProfilePanel staff={selected} />
                {selected.isTrainer ? (
                  <StaffClassesSection staff={selected} onAddClass={handleAddClass} />
                ) : null}
                {selected.isAdmin ? <StaffPermissionsSection staff={selected} /> : null}
              </VStack>
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Staff",
              endActions: [
                {
                  type: "custom",
                  id: "add-staff",
                  label: "Add staff",
                  icon: <Plus size={16} strokeWidth={1.75} />,
                  onClick: () => setIsAddOpen(true),
                },
              ],
            }}
            controls={
              <ViewTabs aria-label="Staff views">
                <ViewTab label="All Staff" selected={view === "all"} onClick={() => changeView("all")} />
                <ViewTab
                  label="Trainers"
                  selected={view === "trainers"}
                  onClick={() => changeView("trainers")}
                />
                <ViewTab
                  label="Admins"
                  selected={view === "admins"}
                  onClick={() => changeView("admins")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <StaffTable data={filteredStaff} onSelectStaff={(row) => setSelectedId(row.id)} />

        <AddStaffModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={(row) => {
            setStaff((current) => [...current, row]);
            setIsAddOpen(false);
          }}
        />
      </FoundationLayout>
    </div>
  );
}
