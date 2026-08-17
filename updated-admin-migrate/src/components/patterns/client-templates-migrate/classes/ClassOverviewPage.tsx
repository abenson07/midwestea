"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassDetailsCard } from "./ClassDetailsCard";
import { ClassPrerequisitesQueue } from "./ClassPrerequisitesQueue";
import { ClassPrerequisitesList } from "./ClassPrerequisitesList";
import { ClassActivityCard } from "./ClassActivityCard";
import { ClassDueInvoicesSection } from "./ClassDueInvoicesSection";
import { ClassRosterSection } from "./ClassRosterSection";
import {
  classActivityFor,
  classDueInvoicesFor,
  classPrerequisiteQueueFor,
  type ClassDetail,
  type ClassRosterRow,
} from "./classMocks";

export type ClassOverviewPageProps = {
  classDetail: ClassDetail;
  roster: ClassRosterRow[];
  onEditDetails?: () => void;
};

export function ClassOverviewPage({ classDetail, roster, onEditDetails }: ClassOverviewPageProps) {
  const invoices = classDueInvoicesFor(classDetail.id);
  const submissions = classPrerequisiteQueueFor(classDetail.id);
  const activity = classActivityFor(classDetail.id);

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 24,
          alignItems: "start",
        }}
        className="class-overview-layout"
      >
        <style>{`
          @media (max-width: 900px) {
            .class-overview-layout {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <ClassInfoBox classDetail={classDetail} onEditDetails={onEditDetails} />
          <ClassPrerequisitesQueue key={classDetail.id} submissions={submissions} />
          <ClassDueInvoicesSection invoices={invoices} />
          <ClassRosterSection rows={roster} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <ClassDetailsCard classDetail={classDetail} />
          <ClassPrerequisitesList items={classDetail.prerequisites} />
          <ClassActivityCard items={activity} />
        </div>
      </div>
    </ClassContentPage>
  );
}
