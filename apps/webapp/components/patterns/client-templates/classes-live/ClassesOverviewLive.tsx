"use client";

import { Grid } from "@/components/patterns/primitives/Grid";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { MetricCard } from "@/components/patterns/client-templates/classes";
import { OnlineClassesList } from "@/components/patterns/client-templates/classes";
import { OtherClassesList } from "@/components/patterns/client-templates/classes";
import { ProgramClassesTableLive } from "./ProgramClassesTableLive";
import type { ProgramClassRow, OnlineClassRow, OtherClassRow } from "@/data/mocks/classes";

const activeStatuses = new Set(["enrolling", "active"]);

export type ClassesOverviewLiveProps = {
  programClasses: ProgramClassRow[];
  onlineClasses: OnlineClassRow[];
  otherClasses: OtherClassRow[];
  onToggleOnlineClass: (row: OnlineClassRow, next: boolean) => void;
  onSelectOnlineClass: (row: OnlineClassRow) => void;
  onSelectOtherClass: (row: OtherClassRow) => void;
};

export function ClassesOverviewLive({
  programClasses,
  onlineClasses,
  otherClasses,
  onToggleOnlineClass,
  onSelectOnlineClass,
  onSelectOtherClass,
}: ClassesOverviewLiveProps) {
  const activeClasses = programClasses.filter((row) => activeStatuses.has(row.status));
  const totalEnrolled = activeClasses.reduce((sum, row) => sum + row.enrolledCount, 0);
  const enrollingNow = programClasses.filter((row) => row.status === "enrolling").length;

  return (
    <ClassContentPage>
      <Grid columns={3} gap={4}>
        <MetricCard label="Active Classes" value={String(activeClasses.length)} />
        <MetricCard label="Total Enrolled" value={String(totalEnrolled)} />
        <MetricCard label="Enrolling Now" value={String(enrollingNow)} />
      </Grid>

      <ProgramClassesTableLive data={programClasses} />
      <OnlineClassesList
        data={onlineClasses}
        onToggle={onToggleOnlineClass}
        onSelect={onSelectOnlineClass}
      />
      <OtherClassesList data={otherClasses} onSelect={onSelectOtherClass} />
    </ClassContentPage>
  );
}
