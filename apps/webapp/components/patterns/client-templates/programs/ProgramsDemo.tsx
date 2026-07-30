"use client";

import type { ReactNode } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ProgramsPage } from "./ProgramsPage";

export type ProgramsDemoProps = {
  navigation?: ReactNode;
};

export function ProgramsDemo({ navigation }: ProgramsDemoProps = {}) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        header={<CanvasHeader topbar={{ title: "Programs" }} />}
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
          <ProgramsPage />
        </div>
      </FoundationLayout>
    </div>
  );
}
