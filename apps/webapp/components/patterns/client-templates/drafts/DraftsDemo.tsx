"use client";

import { Trash2 } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { DraftsPage } from "./DraftsPage";

export function DraftsDemo() {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: "Drafts",
              endActions: [
                {
                  type: "custom",
                  id: "delete",
                  label: "Delete all drafts",
                  icon: <Trash2 size={16} strokeWidth={1.75} />,
                },
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
          <DraftsPage />
        </div>
      </FoundationLayout>
    </div>
  );
}
