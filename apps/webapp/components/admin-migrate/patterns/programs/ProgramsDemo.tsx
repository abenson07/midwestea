"use client";

import { FoundationLayout } from "@/components/admin-migrate/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/admin-migrate/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/admin-migrate/patterns/foundation/LinearSidebar";
import { ProgramsPage } from "./ProgramsPage";
import type { CatalogTemplate } from "../catalog/catalogMocks";

export type ProgramsDemoProps = {
  /** When omitted, the list stays on demo mocks (`/admin-preview`). */
  templates?: CatalogTemplate[];
};

/** Copied structurally from Committees — placeholder cards until Programs gets real data. */
export function ProgramsDemo({ templates }: ProgramsDemoProps = {}) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
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
          <ProgramsPage templates={templates} />
        </div>
      </FoundationLayout>
    </div>
  );
}
