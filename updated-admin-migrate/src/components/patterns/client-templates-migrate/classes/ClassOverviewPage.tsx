"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassEmptyPanel } from "./ClassEmptyPanel";
import { ClassDetailsCard } from "./ClassDetailsCard";
import { ClassPrerequisitesCard } from "./ClassPrerequisitesCard";
import { ClassRosterSection } from "./ClassRosterSection";
import type { ClassDetail, ClassRosterRow } from "./classMocks";

export type ClassOverviewPageProps = {
  classDetail: ClassDetail;
  roster: ClassRosterRow[];
  onEditDetails?: () => void;
};

export function ClassOverviewPage({ classDetail, roster, onEditDetails }: ClassOverviewPageProps) {
  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <ClassInfoBox classDetail={classDetail} onEditDetails={onEditDetails} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              alignItems: "stretch",
            }}
            className="class-overview-mid"
          >
            <style>{`
              @media (max-width: 900px) {
                .class-overview-mid {
                  grid-template-columns: minmax(0, 1fr) !important;
                }
              }
            `}</style>
            <ClassPrerequisitesCard items={classDetail.prerequisites} />
            <ClassEmptyPanel title="Invoices" emptyLabel="No invoices yet." />
          </div>
          <ClassRosterSection rows={roster} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <ClassDetailsCard classDetail={classDetail} />
        </div>
      </div>
    </ClassContentPage>
  );
}
