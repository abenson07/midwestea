"use client";

import { Grid } from "@/components/patterns/primitives/Grid";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { MetricCard } from "./MetricCard";
import { ProgramClassesTable } from "./ProgramClassesTable";
import { OnlineClassesList } from "./OnlineClassesList";
import { OtherClassesList } from "./OtherClassesList";
import {
  sampleProgramClasses,
  sampleOtherClasses,
  type OnlineClassRow,
  type OtherClassRow,
} from "@/data/mocks/classes";

const activeStatuses = new Set(["enrolling", "active"]);
const activeClasses = sampleProgramClasses.filter((row) => activeStatuses.has(row.status));
const totalEnrolled = activeClasses.reduce((sum, row) => sum + row.enrolledCount, 0);
const enrollingNow = sampleProgramClasses.filter((row) => row.status === "enrolling").length;

export type ClassesOverviewPageProps = {
  onlineClasses: OnlineClassRow[];
  onToggleOnlineClass: (row: OnlineClassRow, next: boolean) => void;
  onSelectOnlineClass: (row: OnlineClassRow) => void;
  onSelectOtherClass: (row: OtherClassRow) => void;
};

export function ClassesOverviewPage({
  onlineClasses,
  onToggleOnlineClass,
  onSelectOnlineClass,
  onSelectOtherClass,
}: ClassesOverviewPageProps) {
  return (
    <ClassContentPage>
      <Grid columns={3} gap={4}>
        <MetricCard label="Active Classes" value={String(activeClasses.length)} />
        <MetricCard label="Total Enrolled" value={String(totalEnrolled)} />
        <MetricCard label="Enrolling Now" value={String(enrollingNow)} />
      </Grid>

      <ProgramClassesTable />
      <OnlineClassesList
        data={onlineClasses}
        onToggle={onToggleOnlineClass}
        onSelect={onSelectOnlineClass}
      />
      <OtherClassesList data={sampleOtherClasses} onSelect={onSelectOtherClass} />
    </ClassContentPage>
  );
}
