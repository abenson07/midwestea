"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import {
  CanvasHeader,
  type CanvasTopbarBreadcrumb,
} from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { ComingSoon, EmptyStateCard, OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { useEventContext } from "@/components/integrated/events/EventContext";
import EventDetailsPanel from "@/components/integrated/events/EventDetailsPanel";
import EditSponsorshipTiersModal from "@/components/sponsorship/EditSponsorshipTiersModal";
import {
  MobileAdminShell,
  MobileEventDetail,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import type { EventEdition } from "@/lib/events/eventData";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import { supabaseClient } from "@/lib/supabaseClient";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { useDemoGuard, useFavorites } from "hooks";
import { EventDraftBanner } from "./EventDraftBanner";
import { EventOverviewPage } from "./EventOverviewPage";
import { VolunteersPage } from "./VolunteersPage";
import { BudgetPage } from "./BudgetPage";
import { EventTasksPage } from "./EventTasksPage";
import { VolunteerDetailPanel } from "./VolunteerDetailPanel";
import { BudgetDetailPanel } from "./BudgetDetailPanel";
import { SponsorshipInvoiceDetailPanel } from "./SponsorshipInvoiceDetailPanel";
import { SponsorDetailPanel } from "./SponsorDetailPanel";
import {
  AddEventTaskModal,
  AssignVolunteerModal,
  AddSponsorModal,
  EventCreateInvoiceModal,
  EditBudgetAmountModal,
} from "./EventOverviewModals";
import {
  eventMocksFor,
  eventTaskGroupForDueDate,
  formatEventTaskDueLabel,
  type DemoVolunteerAsk,
  type EventBudgetRow,
  type EventBudgetSummary,
  type EventDetail,
  type EventSponsorRow,
  type EventSponsorshipInvoiceRow,
  type EventTaskGroupLabel,
  type EventTaskRow,
} from "@/data/mocks/events";
import {
  listDemoScoped,
  newDemoId,
  writeDemoScoped,
} from "@/lib/demo/demoStore";
import type { EventVolunteerRow } from "./VolunteersPage";
import type { Task } from "@/components/leaflet/types";

/** Live `context.tasks` uses the shared leaflet/event schedule shape — remap into this page's `EventTaskRow` shape. */
function toEventTaskRow(task: Task): EventTaskRow {
  const group: EventTaskGroupLabel =
    task.group === "Six months out" ? "6 months out" : (task.group as EventTaskGroupLabel);
  return {
    id: task.id,
    title: task.title,
    group,
    dueLabel: task.dueLabel,
    isComplete: task.is_complete,
    isOverdue: Boolean(task.isOverdue),
  };
}

type EventDetailView = "overview" | "details" | "volunteers" | "tasks" | "budget" | "promotion";

function isEventDetailView(value: string | null): value is EventDetailView {
  return (
    value === "overview" ||
    value === "details" ||
    value === "volunteers" ||
    value === "tasks" ||
    value === "budget" ||
    value === "promotion"
  );
}

const EVENT_VIEW_LABELS: Record<Exclude<EventDetailView, "overview">, string> = {
  details: "Settings",
  volunteers: "Volunteers",
  tasks: "Tasks",
  budget: "Sponsorships",
  promotion: "Promotion",
};

type Selection =
  | { kind: "volunteer"; row: EventVolunteerRow }
  | { kind: "budget"; row: EventBudgetRow }
  | { kind: "sponsorship-invoice"; row: EventSponsorshipInvoiceRow }
  | { kind: "sponsor"; row: EventSponsorRow }
  | null;

type ModalKind =
  | "task"
  | "volunteer"
  | "sponsor"
  | "invoice"
  | "budget"
  | "levels"
  | null;

function formatEventWhen(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "—" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

function liveEventDetail(event: EventEdition | null): EventDetail {
  if (!event) {
    return {
      id: "",
      title: "Event",
      committee: "events",
      date: "—",
      time: "—",
      location: "—",
      description: "",
      organizer: "—",
    };
  }
  const { date, time } = formatEventWhen(event.starts_at);
  const ends = event.ends_at ? formatEventWhen(event.ends_at).time : null;
  const committee = event.committee ?? "events";
  return {
    id: event.id,
    title: event.title,
    committee,
    date,
    time: ends ? `${time} – ${ends}` : time,
    location: event.fieldData.location ?? event.fieldData.address ?? "—",
    description: event.fieldData.description ?? event.fieldData.marketing?.shortDescription ?? "",
    organizer: event.committee
      ? `${COMMITTEE_LABELS[event.committee]} Committee`
      : "MLCC",
  };
}

function daysOffsetFromAnchor(dueDate: string, anchorIso: string | null): number {
  if (!anchorIso) return 0;
  const due = new Date(`${dueDate}T12:00:00`);
  const anchor = new Date(`${anchorIso.slice(0, 10)}T12:00:00`);
  return Math.round((due.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
}

export type EventDetailDemoProps = {
  navigation?: ReactNode;
};

export function EventDetailDemo({ navigation }: EventDetailDemoProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobileAdmin();
  const { enabled: demo } = useDemoModeOptional();
  const { guard } = useDemoGuard();
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    eventId,
    event,
    budget,
    volunteerAsks,
    tasks: contextTasks,
    toggleTask: contextToggleTask,
    createTask,
    removeTask: contextRemoveTask,
    createSponsorship,
    updateEvent,
    saveSponsorshipTiers,
    sponsorshipTierSeeds,
    sponsorshipTiers,
    refetchAll,
  } = useEventContext();
  const initialView = searchParams.get("view");
  const [view, setView] = useState<EventDetailView>(
    isEventDetailView(initialView) ? initialView : "overview",
  );
  const [selection, setSelection] = useState<Selection>(null);
  const [demoTasks, setDemoTasks] = useState<EventTaskRow[]>([]);
  const [demoAsks, setDemoAsks] = useState<DemoVolunteerAsk[]>([]);
  const [demoSponsors, setDemoSponsors] = useState<EventSponsorRow[]>([]);
  const [demoBudgetSummary, setDemoBudgetSummary] = useState<EventBudgetSummary | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  const mocks = useMemo(() => (demo ? eventMocksFor(eventId) : null), [demo, eventId]);

  useEffect(() => {
    if (!mocks) {
      setDemoTasks([]);
      setDemoAsks([]);
      setDemoSponsors([]);
      setDemoBudgetSummary(null);
      return;
    }
    setDemoTasks(listDemoScoped<EventTaskRow>("eventTasks", eventId) ?? mocks.tasks);
    setDemoAsks(listDemoScoped<DemoVolunteerAsk>("eventAsks", eventId) ?? mocks.volunteerAsks);
    setDemoSponsors(listDemoScoped<EventSponsorRow>("sponsorships", eventId) ?? mocks.sponsors);
    const storedBudget = listDemoScoped<EventBudgetSummary & { id: string }>("events", `budget-${eventId}`);
    setDemoBudgetSummary(storedBudget?.[0] ?? mocks.budgetSummary);
  }, [mocks, eventId]);

  function persistDemoTasks(next: EventTaskRow[]) {
    setDemoTasks(next);
    writeDemoScoped("eventTasks", eventId, next);
  }

  function persistDemoAsks(next: DemoVolunteerAsk[]) {
    setDemoAsks(next);
    writeDemoScoped("eventAsks", eventId, next);
  }

  function persistDemoSponsors(next: EventSponsorRow[]) {
    setDemoSponsors(next);
    writeDemoScoped("sponsorships", eventId, next);
  }

  function persistDemoBudget(next: EventBudgetSummary) {
    setDemoBudgetSummary(next);
    writeDemoScoped("events", `budget-${eventId}`, [{ id: "summary", ...next }]);
  }

  const liveTasks = useMemo(() => contextTasks.map(toEventTaskRow), [contextTasks]);
  const tasks = mocks ? demoTasks : liveTasks;

  const overviewEvent = useMemo(
    () => (mocks ? mocks.detail : liveEventDetail(event)),
    [mocks, event],
  );

  const budgetSummary: EventBudgetSummary = useMemo(() => {
    if (mocks) return demoBudgetSummary ?? mocks.budgetSummary;
    return {
      totalBudget: budget.goal,
      received: budget.raised,
      pending: budget.pledged,
    };
  }, [mocks, demoBudgetSummary, budget.goal, budget.raised, budget.pledged]);

  const asksForModal = mocks ? demoAsks : volunteerAsks;
  const levelsForModal = mocks
    ? mocks.sponsorshipLevels.map((l) => ({
        id: l.id,
        name: l.name,
        price: l.price,
      }))
    : sponsorshipTiers.map((t, i) => ({
        id: t.itemId ?? `tier-${i}`,
        name: t.name,
        price: `$${t.amount.toLocaleString()}`,
      }));

  if (isMobile) {
    return (
      <MobileAdminShell active="events">
        <MobileEventDetail />
      </MobileAdminShell>
    );
  }

  function changeView(next: EventDetailView) {
    setView(next);
    setSelection(null);
  }

  function selectVolunteer(row: EventVolunteerRow) {
    setSelection({ kind: "volunteer", row });
  }

  function selectBudgetItem(row: EventBudgetRow) {
    setSelection({ kind: "budget", row });
  }

  function selectSponsorshipInvoice(row: EventSponsorshipInvoiceRow) {
    setSelection({ kind: "sponsorship-invoice", row });
  }

  function selectSponsor(row: EventSponsorRow) {
    setSelection({ kind: "sponsor", row });
  }

  function toggleTask(id: string) {
    if (mocks) {
      void guard(async () => undefined, {
        action: "Task updated",
        local: () => {
          persistDemoTasks(
            demoTasks.map((task) =>
              task.id === id ? { ...task, isComplete: !task.isComplete } : task,
            ),
          );
        },
      });
      return;
    }
    void guard(() => Promise.resolve(contextToggleTask(id)), { action: "Task updated" });
  }

  function addTaskLocal({ title, dueDate }: { title: string; dueDate: string }) {
    const group = eventTaskGroupForDueDate(dueDate, mocks?.dateIso ?? dueDate);
    const isOverdue = group === "Past due";
    persistDemoTasks([
      ...demoTasks,
      {
        id: newDemoId("task"),
        title,
        group,
        dueLabel: formatEventTaskDueLabel(dueDate, isOverdue),
        isComplete: false,
        isOverdue,
      },
    ]);
    toast.success("Task added — demo mode, saved locally only");
  }

  function removeTask(id: string) {
    if (mocks) {
      void guard(async () => undefined, {
        action: "Task removed",
        local: () => persistDemoTasks(demoTasks.filter((task) => task.id !== id)),
      });
      return;
    }
    void guard(() => contextRemoveTask(id), { action: "Task removed" });
  }


  const isFullBleed = view === "details";
  const eventTitle = event?.title ?? (mocks ? mocks.detail.title : "Event");
  const statusLabel =
    event?.publishStatus === "draft"
      ? "Draft"
      : event?.publishStatus === "published"
        ? "Published"
        : null;

  const eventsCrumb: CanvasTopbarBreadcrumb = {
    label: "Events",
    onClick: () => router.push("/admin-preview/events"),
  };
  const eventCrumb: CanvasTopbarBreadcrumb = {
    label: eventTitle,
    onClick: () => changeView("overview"),
  };
  const topbarTitle = view === "overview" ? eventTitle : EVENT_VIEW_LABELS[view];
  const topbarBreadcrumbs: CanvasTopbarBreadcrumb[] =
    view === "overview" ? [eventsCrumb] : [eventsCrumb, eventCrumb];
  const currentRoute = normalizeRoute(
    searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname,
  );

  const body =
    view === "details" ? (
      <div
        style={{
          height: "100%",
          minHeight: 0,
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <EventDetailsPanel topBanner={<EventDraftBanner />} />
      </div>
    ) : view === "volunteers" ? (
      <VolunteersPage
        onSelectVolunteer={selectVolunteer}
        demoAsks={mocks ? demoAsks : undefined}
        onAddVolunteer={() => setModal("volunteer")}
      />
    ) : view === "budget" ? (
      <BudgetPage
        onSelectBudgetItem={selectSponsorshipInvoice}
        onAddSponsor={() => setModal("sponsor")}
        onEditLevels={() => setModal("levels")}
      />
    ) : view === "tasks" ? (
      tasks.length === 0 ? (
        <div style={{ padding: "32px 24px" }}>
          <EmptyStateCard
            variant="pill"
            label="Add new task"
            onClick={() => setModal("task")}
          />
        </div>
      ) : (
        <EventTasksPage
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={addTaskLocal}
          onRemoveTask={removeTask}
        />
      )
    ) : view === "promotion" ? (
      <ComingSoon label="Promotion" fullPage />
    ) : (
      <EventOverviewPage
        event={overviewEvent}
        budgetSummary={budgetSummary}
        tasks={tasks}
        onToggleTask={toggleTask}
        onSeeAllTasks={() => changeView("tasks")}
        onViewBudget={() => changeView("budget")}
        onSelectVolunteer={selectVolunteer}
        onSeeAllVolunteers={() => changeView("volunteers")}
        onSelectSponsor={selectSponsor}
        onSelectInvoice={selectBudgetItem}
        onSeeAllSponsors={() => changeView("budget")}
        onSeeAllInvoices={() => changeView("budget")}
        onSeeAllLevels={() => changeView("budget")}
        onEditDetails={() => changeView("details")}
        onAddTask={() => setModal("task")}
        onAddVolunteer={() => setModal("volunteer")}
        onAddSponsor={() => setModal("sponsor")}
        onAddInvoice={() => setModal("invoice")}
        onEditBudget={() => setModal("budget")}
        onEditLevels={() => setModal("levels")}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "volunteer" ? (
                <VolunteerDetailPanel volunteer={selection.row} />
              ) : selection.kind === "sponsor" ? (
                <SponsorDetailPanel sponsor={selection.row} />
              ) : selection.kind === "sponsorship-invoice" ? (
                <SponsorshipInvoiceDetailPanel invoice={selection.row} />
              ) : (
                <BudgetDetailPanel item={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: topbarTitle,
              breadcrumbs: topbarBreadcrumbs,
              titleAdornment:
                view === "overview" ? (
                  <Badge
                    label={
                      statusLabel ??
                      (mocks ? COMMITTEE_LABELS[mocks.detail.committee] : "Event")
                    }
                  />
                ) : undefined,
              hasFavorite: true,
              isFavorite: isFavorite(currentRoute),
              onFavoriteClick: () =>
                void toggleFavorite({ name: topbarTitle, route: currentRoute }),
              endContent:
                view === "volunteers" ? (
                  <Button
                    label="Add Volunteer"
                    variant="secondary"
                    icon={<Plus size={14} strokeWidth={1.75} />}
                    onClick={() => setModal("volunteer")}
                  />
                ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Event views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Settings"
                  selected={view === "details"}
                  onClick={() => changeView("details")}
                />
                <ViewTab
                  label="Volunteers"
                  selected={view === "volunteers"}
                  onClick={() => changeView("volunteers")}
                />
                <ViewTab
                  label="Tasks"
                  selected={view === "tasks"}
                  onClick={() => changeView("tasks")}
                />
                <ViewTab
                  label="Sponsorships"
                  selected={view === "budget"}
                  onClick={() => changeView("budget")}
                />
                <ViewTab
                  label="Promotion"
                  selected={view === "promotion"}
                  onClick={() => changeView("promotion")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <AddEventTaskModal
        isOpen={modal === "task"}
        eventTitle={eventTitle}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          if (mocks) {
            addTaskLocal({ title: payload.title, dueDate: payload.dueDate });
            return;
          }
          await guard(
            async () => {
              const offset = daysOffsetFromAnchor(payload.dueDate, event?.anchorDate ?? null);
              await createTask({
                title: payload.title,
                offset_days: offset,
                description: payload.description || null,
              });
              if (payload.addToFuturePlans) {
                toast.message("Saved to this event — future-plans templates are unchanged for now");
              }
            },
            { action: "Task added" },
          );
        }}
      />

      <AssignVolunteerModal
        isOpen={modal === "volunteer"}
        asks={asksForModal}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          await guard(
            async () => {
              if (!supabaseClient) throw new Error("Not connected");
              let personId = payload.personId;
              if (payload.createPerson || !personId) {
                const { data, error } = await supabaseClient
                  .from("people")
                  .insert({
                    full_name: payload.name,
                    email: payload.email || null,
                  })
                  .select("id")
                  .single();
                if (error) throw error;
                personId = data.id;
              }
              const askIds = payload.askIds.length
                ? payload.askIds
                : asksForModal[0]
                  ? [asksForModal[0].id]
                  : [];
              for (const askId of askIds) {
                const { error } = await supabaseClient.from("volunteers").insert({
                  volunteer_ask_id: askId,
                  person_id: personId,
                  status: "accepted",
                });
                if (error) throw error;
              }
              await refetchAll();
            },
            {
              action: "Volunteer added",
              local: () => {
                const askIds = payload.askIds.length
                  ? payload.askIds
                  : demoAsks[0]
                    ? [demoAsks[0].id]
                    : [];
                const next = demoAsks.map((ask) => {
                  if (!askIds.includes(ask.id)) return ask;
                  const signup = {
                    id: newDemoId("signup"),
                    status: "accepted" as const,
                    person: {
                      full_name: payload.name,
                      email: payload.email || null,
                    },
                  };
                  const signups = [...ask.signups, signup];
                  return {
                    ...ask,
                    signups,
                    signup_count: signups.length,
                    remaining_slots: Math.max(0, ask.quantity - signups.length),
                  };
                });
                persistDemoAsks(next);
              },
            },
          );
        }}
      />

      <AddSponsorModal
        isOpen={modal === "sponsor"}
        levels={levelsForModal}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          await guard(
            async () => {
              if (payload.inKind) {
                const cents = Math.round(parseFloat(payload.donationAmount || "0") * 100);
                await createSponsorship({
                  business_id: payload.businessId,
                  description: "In-kind donation",
                  amount: Number.isFinite(cents) ? cents / 100 : 0,
                  quantity: 1,
                  status: "paid",
                  memo: `In-kind — ${payload.businessName}`,
                });
              } else {
                const level =
                  levelsForModal.find((l) => l.id === payload.levelId) ?? levelsForModal[0];
                const matchingTier = sponsorshipTiers.find((t) => t.name === level?.name);
                const amountFromPrice = level?.price
                  ? Number(String(level.price).replace(/[^0-9.]/g, ""))
                  : matchingTier?.amount ?? 0;
                await createSponsorship({
                  business_id: payload.businessId,
                  sponsorship_item_id: matchingTier?.itemId ?? null,
                  description: level?.name ?? "Sponsorship",
                  amount: amountFromPrice,
                  quantity: 1,
                  status: payload.alreadyPaid ? "paid" : "pledged",
                  memo: payload.alreadyPaid ? "Paid by cash or check" : null,
                });
                if (!payload.alreadyPaid && payload.businessId) {
                  toast.message("Sponsorship added — send invoice from Invoices if needed");
                }
              }
              await refetchAll();
            },
            {
              action: payload.inKind ? "Donation added" : "Sponsor added",
              local: () => {
                const level =
                  levelsForModal.find((l) => l.id === payload.levelId) ?? levelsForModal[0];
                const amount = payload.inKind
                  ? Number.parseFloat(payload.donationAmount || "0") || 0
                  : Number(String(level?.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
                persistDemoSponsors([
                  ...demoSponsors,
                  {
                    id: newDemoId("sponsor"),
                    name: payload.businessName || "New sponsor",
                    tier: payload.inKind ? "In-kind" : (level?.name ?? "Sponsor"),
                    status: payload.alreadyPaid || payload.inKind ? "Confirmed" : "Pending",
                  },
                ]);
                if (demoBudgetSummary) {
                  persistDemoBudget({
                    ...demoBudgetSummary,
                    received:
                      demoBudgetSummary.received +
                      (payload.alreadyPaid || payload.inKind ? amount : 0),
                    pending:
                      demoBudgetSummary.pending +
                      (payload.alreadyPaid || payload.inKind ? 0 : amount),
                  });
                }
              },
            },
          );
        }}
      />

      <EventCreateInvoiceModal
        isOpen={modal === "invoice"}
        eventId={eventId}
        onClose={() => setModal(null)}
        onCreated={async () => {
          await refetchAll();
        }}
      />

      <EditBudgetAmountModal
        isOpen={modal === "budget"}
        currentCents={(demoBudgetSummary?.totalBudget ?? budget.goal) * 100}
        onClose={() => setModal(null)}
        onSubmit={async (goalCents) => {
          await guard(
            async () => {
              await updateEvent({
                field_data: {
                  ...(event?.fieldData ?? {}),
                  sponsorship_goal_cents: goalCents,
                },
              });
              await refetchAll();
            },
            {
              action: "Budget updated",
              local: () => {
                const current = demoBudgetSummary ?? mocks?.budgetSummary;
                if (current) {
                  persistDemoBudget({ ...current, totalBudget: goalCents / 100 });
                }
              },
            },
          );
        }}
      />

      <EditSponsorshipTiersModal
        isOpen={modal === "levels"}
        onClose={() => setModal(null)}
        initialTiers={
          mocks
            ? mocks.sponsorshipLevels.map((l) => ({
                name: l.name,
                amount: Number(String(l.price).replace(/[^0-9.]/g, "")) || 0,
                quantity: l.quantityAvailable,
              }))
            : sponsorshipTierSeeds
        }
        onSave={async (tiers) => {
          await saveSponsorshipTiers(tiers);
          await refetchAll();
        }}
      />
    </div>
  );
}
