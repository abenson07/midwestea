"use client";

import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { CoursesPage } from "./CoursesPage";
import type { CatalogTemplate } from "../catalog/catalogMocks";

export type CoursesDemoProps = {
  /** When omitted, the list stays on demo mocks (`/admin-preview`). */
  templates?: CatalogTemplate[];
};

/** Copied structurally from Committees — placeholder cards until Courses gets real data. */
export function CoursesDemo({ templates }: CoursesDemoProps = {}) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
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
          <CoursesPage templates={templates} />
        </div>
      </FoundationLayout>
    </div>
  );
}
