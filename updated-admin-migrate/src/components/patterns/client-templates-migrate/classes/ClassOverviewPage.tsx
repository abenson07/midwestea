"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ClassInfoBox } from "./ClassInfoBox";
import { ClassEmptyPanel } from "./ClassEmptyPanel";
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
        <ClassEmptyPanel title="Prerequisites" emptyLabel="No prerequisites yet." />
        <ClassEmptyPanel title="Invoices" emptyLabel="No invoices yet." />
      </div>
      <ClassRosterSection rows={roster} />
    </ClassContentPage>
  );
}
