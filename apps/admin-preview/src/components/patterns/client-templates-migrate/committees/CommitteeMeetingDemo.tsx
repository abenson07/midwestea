"use client";

import { useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { CommitteeMeetingWorkspace } from "./CommitteeMeetingWorkspace";
import { committeeDisplayName, resolveCommitteeSlug } from "./committeeSlug";

export type CommitteeMeetingDemoProps = {
  committeeId: string;
  meetingId: string;
};

export function CommitteeMeetingDemo({ committeeId, meetingId }: CommitteeMeetingDemoProps) {
  const router = useRouter();
  const slug = resolveCommitteeSlug(committeeId);
  const label = slug ? committeeDisplayName(slug) : committeeId;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={960}
        header={
          <CanvasHeader
            topbar={{
              title: "Meeting minutes",
              breadcrumbs: [
                {
                  label: "Committees",
                  onClick: () => router.push("/admin/committees"),
                },
                {
                  label,
                  onClick: () =>
                    router.push(`/admin/committees/${encodeURIComponent(committeeId)}`),
                },
                { label: "Meeting" },
              ],
            }}
          />
        }
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "auto",
            boxSizing: "border-box",
            padding: "32px 24px 64px",
          }}
        >
          <CommitteeMeetingWorkspace meetingId={meetingId} committeeId={committeeId} />
        </div>
      </FoundationLayout>
    </div>
  );
}
