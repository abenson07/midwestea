"use client";

import { useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { TransactionsOverviewPage } from "./TransactionsOverviewPage";
import { PastDuePage } from "./PastDuePage";
import { ActiveClassesPage } from "./ActiveClassesPage";
import { CoursesPage } from "./CoursesPage";
import { AllTransactionsPage } from "./AllTransactionsPage";

type TransactionsView = "overview" | "past-due" | "active-classes" | "courses" | "all";

const VIEW_TABS: { key: TransactionsView; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "past-due", label: "Past Due" },
  { key: "active-classes", label: "Active Classes" },
  { key: "courses", label: "Courses" },
  { key: "all", label: "All Transactions" },
];

export function TransactionsDemo() {
  const [view, setView] = useState<TransactionsView>("overview");

  const body =
    view === "past-due" ? (
      <PastDuePage />
    ) : view === "active-classes" ? (
      <ActiveClassesPage />
    ) : view === "courses" ? (
      <CoursesPage />
    ) : view === "all" ? (
      <AllTransactionsPage />
    ) : (
      <TransactionsOverviewPage />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{ title: "Transactions" }}
            controls={
              <ViewTabs aria-label="Transactions views">
                {VIEW_TABS.map((tab) => (
                  <ViewTab
                    key={tab.key}
                    label={tab.label}
                    selected={view === tab.key}
                    onClick={() => setView(tab.key)}
                  />
                ))}
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
    </div>
  );
}
