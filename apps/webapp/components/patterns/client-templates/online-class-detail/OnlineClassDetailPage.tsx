"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { OnlineClassInfoBox } from "./OnlineClassInfoBox";
import { RecentStudentsSection } from "./RecentStudentsSection";
import type {
  OnlineClassStudentRow,
  OnlineClassSummary,
} from "@/data/mocks/online-class-detail";

export type OnlineClassDetailPageProps = {
  summary: OnlineClassSummary;
  onSelectStudent?: (row: OnlineClassStudentRow) => void;
};

/**
 * Online Class Detail Overview: info box, then Recent Students. No
 * prerequisites or invoices apply to online classes; the full roster lives
 * on the "All Students" tab (`AllStudentsPage`).
 */
export function OnlineClassDetailPage({ summary, onSelectStudent }: OnlineClassDetailPageProps) {
  return (
    <ClassContentPage>
      <OnlineClassInfoBox summary={summary} />
      <RecentStudentsSection onSelectStudent={onSelectStudent} />
    </ClassContentPage>
  );
}
