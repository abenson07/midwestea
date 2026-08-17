"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { EventInfoBox } from "./EventInfoBox";
import { BudgetChart } from "./BudgetChart";
import { EventTasksSection } from "./EventTasksSection";
import { VolunteersListSection } from "./VolunteersListSection";
import { SponsorsListSection } from "./SponsorsListSection";
import { InvoicesListSection } from "./InvoicesListSection";
import { SponsorshipLevelsPanel } from "./SponsorshipLevelsPanel";
import type {
  EventBudgetRow,
  EventBudgetSummary,
  EventDetail,
  EventSponsorRow,
  EventTaskRow,
} from "@/data/mocks/events";
import type { EventVolunteerRow } from "./VolunteersPage";

export type EventOverviewPageProps = {
  event: EventDetail;
  budgetSummary: EventBudgetSummary;
  tasks: EventTaskRow[];
  onToggleTask: (id: string) => void;
  onSeeAllTasks?: () => void;
  onViewBudget?: () => void;
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
  onSeeAllVolunteers?: () => void;
  onSelectSponsor?: (row: EventSponsorRow) => void;
  onSelectInvoice?: (row: EventBudgetRow) => void;
  onSeeAllSponsors?: () => void;
  onSeeAllInvoices?: () => void;
  onSeeAllLevels?: () => void;
  onEditDetails?: () => void;
  onAddTask?: () => void;
  onAddVolunteer?: () => void;
  onAddSponsor?: () => void;
  onAddInvoice?: () => void;
  onEditBudget?: () => void;
  onEditLevels?: () => void;
};

/**
 * Event Detail Overview: info box, Tasks/Volunteers, budget, then Sponsors / Invoices / Levels.
 */
export function EventOverviewPage({
  event,
  budgetSummary,
  tasks,
  onToggleTask,
  onSeeAllTasks,
  onViewBudget,
  onSelectVolunteer,
  onSeeAllVolunteers,
  onSelectSponsor,
  onSelectInvoice,
  onSeeAllSponsors,
  onSeeAllInvoices,
  onSeeAllLevels,
  onEditDetails,
  onAddTask,
  onAddVolunteer,
  onAddSponsor,
  onAddInvoice,
  onEditBudget,
  onEditLevels,
}: EventOverviewPageProps) {
  return (
    <ClassContentPage>
      <EventInfoBox event={event} onEditDetails={onEditDetails} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <EventTasksSection
          tasks={tasks}
          onToggleTask={onToggleTask}
          onSeeAllTasks={onSeeAllTasks}
          onAddTask={onAddTask}
        />
        <VolunteersListSection
          onSelectVolunteer={onSelectVolunteer}
          onSeeAllVolunteers={onSeeAllVolunteers}
          onAddVolunteer={onAddVolunteer}
        />
      </div>
      <BudgetChart summary={budgetSummary} onViewBudget={onViewBudget} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
        className="event-overview-bottom"
      >
        <style>{`
          @media (max-width: 900px) {
            .event-overview-bottom {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
        <SponsorsListSection
          onSelectSponsor={onSelectSponsor}
          onAddSponsor={onAddSponsor}
          onEditBudget={onEditBudget}
          onEditLevels={onEditLevels}
          onSeeAllSponsors={onSeeAllSponsors}
        />
        <InvoicesListSection
          onSelectInvoice={onSelectInvoice}
          onAddInvoice={onAddInvoice}
          onSeeAllInvoices={onSeeAllInvoices}
        />
        <SponsorshipLevelsPanel onEdit={onEditLevels} onSeeAllLevels={onSeeAllLevels} />
      </div>
    </ClassContentPage>
  );
}
