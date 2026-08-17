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

/** 12-column overview. Tweak `left` / `right` (must sum to `columns`). */
const OVERVIEW_GRID = {
  columns: 24,
  left: 17,
  right: 7,
  gap: 24,
} as const;

export type ClassOverviewPageProps = {
  classDetail: ClassDetail;
  roster: ClassRosterRow[];
  onEditDetails?: () => void;
  onSeeAllInvoices?: () => void;
};

export function ClassOverviewPage({
  classDetail,
  roster,
  onEditDetails,
  onSeeAllInvoices,
}: ClassOverviewPageProps) {
  const invoices = classDueInvoicesFor(classDetail.id);
  const submissions = classPrerequisiteQueueFor(classDetail.id);
  const activity = classActivityFor(classDetail.id);

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${OVERVIEW_GRID.columns}, minmax(0, 1fr))`,
          gap: OVERVIEW_GRID.gap,
          alignItems: "start",
        }}
        className="class-overview-layout"
      >
        <style>{`
          @media (max-width: 900px) {
            .class-overview-layout > [data-slot="class-overview-main"],
            .class-overview-layout > [data-slot="class-overview-rail"] {
              grid-column: 1 / -1 !important;
            }
          }
        `}</style>
        <div
          data-slot="class-overview-main"
          style={{
            gridColumn: `span ${OVERVIEW_GRID.left}`,
            display: "flex",
            flexDirection: "column",
            gap: OVERVIEW_GRID.gap,
            minWidth: 0,
          }}
        >
          <ClassInfoBox classDetail={classDetail} />
          <ClassPrerequisitesQueue key={classDetail.id} submissions={submissions} />
          <ClassDueInvoicesSection invoices={invoices} onSeeAllInvoices={onSeeAllInvoices} />
          <ClassRosterSection rows={roster} />
        </div>
        <div
          data-slot="class-overview-rail"
          style={{
            gridColumn: `span ${OVERVIEW_GRID.right}`,
            display: "flex",
            flexDirection: "column",
            gap: OVERVIEW_GRID.gap,
            minWidth: 0,
          }}
        >
          <ClassDetailsCard classDetail={classDetail} onEditDetails={onEditDetails} />
          <ClassPrerequisitesList key={classDetail.id} items={classDetail.prerequisites} />
          <ClassActivityCard items={activity} />
        </div>
      </div>
    </ClassContentPage>
  );
}
