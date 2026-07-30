"use client";

import type { ReactNode } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { CoursesPage } from "./CoursesPage";

export type CoursesDemoProps = {
  navigation?: ReactNode;
};

export function CoursesDemo({ navigation }: CoursesDemoProps = {}) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        header={<CanvasHeader topbar={{ title: "Courses" }} />}
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
          <CoursesPage />
        </div>
      </FoundationLayout>
    </div>
  );
}
