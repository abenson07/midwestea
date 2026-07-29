"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { StudentsRosterPage, type StudentsView } from "./StudentsRosterPage";

export function StudentsRosterDemo() {
  const [view, setView] = useState<StudentsView>("all");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Students" }}
            controls={
              <ViewTabs aria-label="Students views">
                <ViewTab
                  label="All Students"
                  selected={view === "all"}
                  onClick={() => setView("all")}
                />
                <ViewTab
                  label="Active Students"
                  selected={view === "active"}
                  onClick={() => setView("active")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <StudentsRosterPage view={view} />
      </FoundationLayout>
    </div>
  );
}
