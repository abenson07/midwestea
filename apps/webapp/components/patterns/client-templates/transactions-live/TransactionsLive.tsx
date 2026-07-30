"use client";

import { useEffect, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { TransactionsOverviewPageLive } from "./TransactionsOverviewPageLive";
import { PastDuePageLive } from "./PastDuePageLive";
import { ActiveClassesPageLive } from "./ActiveClassesPageLive";
import { CoursesPageLive } from "./CoursesPageLive";
import { AllTransactionsPageLive } from "./AllTransactionsPageLive";
import { getTransactionRows } from "@/lib/transactions-live";
import type { TransactionRow } from "@/data/mocks/transactions";

type TransactionsView = "overview" | "past-due" | "active-classes" | "courses" | "all";

const VIEW_TABS: { key: TransactionsView; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "past-due", label: "Past Due" },
  { key: "active-classes", label: "Active Classes" },
  { key: "courses", label: "Courses" },
  { key: "all", label: "All Transactions" },
];

export function TransactionsLive() {
  const [view, setView] = useState<TransactionsView>("overview");
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { rows: fetchedRows, error: fetchError } = await getTransactionRows();
      if (cancelled) return;
      if (fetchError) setError(fetchError);
      else if (fetchedRows) setRows(fetchedRows);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const body = loading ? (
    <div style={{ padding: 24, color: "var(--linear-color-ink-subtle)" }}>Loading transactions…</div>
  ) : error ? (
    <div style={{ padding: 24, color: "var(--linear-color-danger, #eb5757)" }}>{error}</div>
  ) : view === "past-due" ? (
    <PastDuePageLive data={rows} />
  ) : view === "active-classes" ? (
    <ActiveClassesPageLive data={rows} />
  ) : view === "courses" ? (
    <CoursesPageLive data={rows} />
  ) : view === "all" ? (
    <AllTransactionsPageLive data={rows} />
  ) : (
    <TransactionsOverviewPageLive data={rows} />
  );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<MigrateSidebar />}
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
