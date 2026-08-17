"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { BudgetChart } from "@/components/patterns/client-templates/events/BudgetChart";
import { LeafletInfoBox } from "./LeafletInfoBox";
import { NextStepBox } from "./NextStepBox";
import { LeafletTasksSection } from "./LeafletTasksSection";
import { OpenRoutesSection } from "./OpenRoutesSection";
import { SkippedRoutesSection } from "./SkippedRoutesSection";
import { LeafletSponsorsSection } from "./LeafletSponsorsSection";
import { StoriesTableSection } from "./StoriesTableSection";
import type {
  LeafletBudgetSummary,
  LeafletDetail,
  LeafletRouteRow,
  LeafletSponsorRow,
  LeafletStoryRow,
  LeafletTaskRow,
} from "@/data/mocks/leaflets";
import { sampleLeafletBudgetSummary } from "@/data/mocks/leaflets";

export type LeafletOverviewPageProps = {
  leaflet: LeafletDetail;
  tasks: LeafletTaskRow[];
  onToggleTask: (id: string) => void;
  onSeeAllTasks?: () => void;
  onSeeAllOpenRoutes?: () => void;
  onViewSponsorships?: () => void;
  onSendReminder?: () => void;
  onSelectOpenRoute?: (row: LeafletRouteRow) => void;
  onSelectSkippedRoute?: (row: LeafletRouteRow) => void;
  onSelectSponsor?: (row: LeafletSponsorRow) => void;
  onSelectStory?: (row: LeafletStoryRow) => void;
  budgetSummary?: LeafletBudgetSummary;
  openRoutes?: LeafletRouteRow[];
  skippedRoutes?: LeafletRouteRow[];
  sponsors?: LeafletSponsorRow[];
  stories?: LeafletStoryRow[];
  reminderDescription?: string;
};

/**
 * Leaflet Detail Overview — mirrors `EventOverviewPage`'s shape, with
 * Open Routes standing in for Volunteers, a five-column Reminder/Budget
 * row instead of a plain budget chart, a Skipped Routes/Sponsorships row,
 * and a full-width Stories table underneath everything.
 */
export function LeafletOverviewPage({
  leaflet,
  tasks,
  onToggleTask,
  onSeeAllTasks,
  onSeeAllOpenRoutes,
  onViewSponsorships,
  onSendReminder,
  onSelectOpenRoute,
  onSelectSkippedRoute,
  onSelectSponsor,
  onSelectStory,
  budgetSummary,
  openRoutes,
  skippedRoutes,
  sponsors,
  stories,
  reminderDescription,
}: LeafletOverviewPageProps) {
  return (
    <ClassContentPage>
      <LeafletInfoBox leaflet={leaflet} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div style={{ gridColumn: "span 4" }}>
          <BudgetChart summary={budgetSummary ?? sampleLeafletBudgetSummary} onViewBudget={onViewSponsorships} />
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <NextStepBox description={reminderDescription} onSend={onSendReminder} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <LeafletTasksSection tasks={tasks} onToggleTask={onToggleTask} onSeeAllTasks={onSeeAllTasks} />
        <OpenRoutesSection
          routes={openRoutes}
          onSelectRoute={onSelectOpenRoute}
          onSeeAllOpenRoutes={onSeeAllOpenRoutes}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <SkippedRoutesSection routes={skippedRoutes} onSelectRoute={onSelectSkippedRoute} />
        <LeafletSponsorsSection sponsors={sponsors} onSelectSponsor={onSelectSponsor} />
      </div>

      <StoriesTableSection stories={stories} onSelectStory={onSelectStory} />
    </ClassContentPage>
  );
}
