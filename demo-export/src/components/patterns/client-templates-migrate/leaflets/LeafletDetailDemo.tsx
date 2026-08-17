"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  useAllSponsorships,
  useDeliveries,
  useDemoGuard,
  useFavorites,
  useLeaflets,
  usePeople,
  useSponsorshipItemOfferings,
  useStories,
  useStripeInvoices,
  useTasks,
  type SponsorshipWithParent,
} from "hooks";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { getApiBase } from "@/lib/apiBase";
import { buildEventBudget } from "@/lib/events/eventData";
import { mapTasksForUi } from "@/components/leaflet/leafletData";
import type { Task } from "@/components/leaflet/types";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { LeafletOverviewPage } from "./LeafletOverviewPage";
import { LeafletDeliverersPage } from "./LeafletDeliverersPage";
import { LeafletRoutesPage } from "./LeafletRoutesPage";
import { LeafletSponsorshipsPage } from "./LeafletSponsorshipsPage";
import { LeafletSchedulePage } from "./LeafletSchedulePage";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { LeafletInvoiceDetailPanel } from "./LeafletInvoiceDetailPanel";
import { StoryDetailPanel } from "./StoryDetailPanel";
import { DelivererPersonPanel } from "./DelivererPersonPanel";
import { EmailDeliverersModal } from "./EmailDeliverersModal";
import { listDemoScoped, writeDemoScoped } from "@/lib/demo/demoStore";
import { deliveriesToRouteRows } from "./adapters";
import {
  leafletTaskGroupForDueDate,
  formatLeafletTaskDueLabel,
  sampleLeafletDetail,
  sampleLeafletTasks,
  type LeafletBudgetSummary,
  type LeafletDelivererRow,
  type LeafletDetail,
  type LeafletRouteRow,
  type LeafletSponsorRow,
  type LeafletSponsorshipInvoiceRow,
  type LeafletStatus,
  type LeafletStoryRow,
  type LeafletTaskGroupLabel,
  type LeafletTaskRow,
} from "@/data/mocks/leaflets";

const LEAFLET_TASK_GROUP_MAP: Record<string, LeafletTaskGroupLabel> = {
  "Past due": "Past due",
  "Six months out": "60 days out",
  "90 days out": "60 days out",
  "60 days out": "60 days out",
  "30 days out": "30 days out",
  "2 weeks out": "2 weeks out",
  "Week of event": "Week of distribution",
  "Day of event": "Day of distribution",
};

/** Live `useTasks` shares the event/leaflet schedule shape — remap into this page's `LeafletTaskRow` shape. */
function toLeafletTaskRow(task: Task): LeafletTaskRow {
  return {
    id: task.id,
    title: task.title,
    group: LEAFLET_TASK_GROUP_MAP[task.group] ?? "Past due",
    dueLabel: task.dueLabel,
    isComplete: task.is_complete,
    isOverdue: Boolean(task.isOverdue),
  };
}

function leafletDaysOffsetFromAnchor(dueDate: string, anchorDate: string | null): number {
  if (!anchorDate) return 0;
  const due = new Date(`${dueDate}T12:00:00`);
  const anchor = new Date(`${anchorDate}T12:00:00`);
  return Math.round((due.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
}

function toLeafletInvoiceRow(
  inv: StripeInvoiceTableRow,
  sponsorships: SponsorshipWithParent[],
  itemNameById: Map<string, string>,
): LeafletSponsorshipInvoiceRow {
  const sponsorship = inv.sponsorship_id ? sponsorships.find((s) => s.id === inv.sponsorship_id) : undefined;
  const level =
    (sponsorship?.sponsorship_item_id && itemNameById.get(sponsorship.sponsorship_item_id)) || "—";
  return {
    id: inv.id,
    invoiceNumber: inv.number ?? inv.id.slice(-8),
    business: inv.customer_email ?? "—",
    level,
    amount: `$${(inv.amount_due / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    dueDate: inv.due_date
      ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    status: inv.status === "paid" ? "Paid" : inv.status === "uncollectible" ? "Overdue" : "Pending",
  };
}

function toLeafletSponsorRow(s: SponsorshipWithParent): LeafletSponsorRow {
  const business = s.businesses as { business_name: string | null } | null | undefined;
  return {
    id: s.id,
    name: business?.business_name ?? "—",
    tier: s.description ?? "—",
    status: s.status === "paid" ? "Confirmed" : "Pending",
  };
}

function toLeafletStoryRow(row: {
  id: string;
  title: string;
  author_id: string | null;
  status: string;
  publish_date: string | null;
}, authorNameById: Map<string, string>): LeafletStoryRow {
  const date = row.publish_date
    ? new Date(`${row.publish_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";
  return {
    id: row.id,
    title: row.title,
    author: (row.author_id && authorNameById.get(row.author_id)) || "—",
    type: "—",
    date,
    time: "—",
    status: row.status === "published" ? "Published" : "Draft",
  };
}

type LeafletDetailView = "overview" | "deliverers" | "routes" | "sponsorships" | "schedule";

type Selection =
  | { kind: "route"; row: LeafletRouteRow }
  | { kind: "invoice"; row: LeafletSponsorshipInvoiceRow }
  | { kind: "story"; row: LeafletStoryRow }
  | { kind: "person"; row: LeafletDelivererRow }
  | null;

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

function formatCountdownLabel(distributionDate: string, status: LeafletStatus): string {
  if (!distributionDate) return "—";
  if (status === "closed") return "Distribution complete";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${distributionDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "—";

  const daysUntil = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil === 0) return "Distributing today";
  if (daysUntil === 1) return "Distributing tomorrow";
  if (daysUntil > 1) return `${daysUntil} days until distribution`;
  if (daysUntil === -1) return "Distributed yesterday";
  return `Distributed ${Math.abs(daysUntil)} days ago`;
}

function liveLeafletDetail(
  id: string,
  leaflets: { id: string; title: string; distribution_date: string; status: string }[],
): LeafletDetail {
  const row = leaflets.find((l) => l.id === id);
  if (!row) {
    return {
      id,
      title: "Leaflet",
      distributionDate: "",
      status: "planned",
      countdownLabel: "—",
    };
  }
  const status =
    row.status === "active" || row.status === "planned" || row.status === "closed"
      ? row.status
      : "planned";
  return {
    id: row.id,
    title: row.title,
    distributionDate: row.distribution_date,
    status,
    countdownLabel: formatCountdownLabel(row.distribution_date, status),
  };
}

export type LeafletDetailDemoProps = {
  navigation?: ReactNode;
};

export function LeafletDetailDemo({ navigation }: LeafletDetailDemoProps = {}) {
  const params = useParams<{ id: string }>();
  const leafletId = typeof params?.id === "string" ? params.id : "";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabled: demoMode } = useDemoModeOptional();
  const { enabled: demoGuard, guard } = useDemoGuard();
  const demo = demoMode || demoGuard;
  const { leaflets } = useLeaflets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentRoute = normalizeRoute(
    searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname,
  );
  const { deliveries } = useDeliveries(leafletId, { enabled: !demo && Boolean(leafletId) });
  const [view, setView] = useState<LeafletDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [demoTasks, setDemoTasks] = useState<LeafletTaskRow[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    if (!demo) {
      setDemoTasks([]);
      return;
    }
    setDemoTasks(
      listDemoScoped<LeafletTaskRow>("leafletTasks", leafletId || "default") ?? sampleLeafletTasks,
    );
  }, [demo, leafletId]);

  function persistDemoTasks(next: LeafletTaskRow[]) {
    setDemoTasks(next);
    writeDemoScoped("leafletTasks", leafletId || "default", next);
  }

  const leaflet = useMemo(
    () => (demo ? sampleLeafletDetail : liveLeafletDetail(leafletId, leaflets)),
    [demo, leafletId, leaflets],
  );

  const {
    tasks: leafletTaskRows,
    toggleComplete: toggleLeafletTaskComplete,
    createTask: createLeafletTaskMutation,
    remove: removeLeafletTaskMutation,
  } = useTasks({
    context: "leaflet",
    contextId: !demo && leafletId ? leafletId : null,
    anchorDate: leaflet.distributionDate || null,
  });

  const liveTasks = useMemo(
    () => mapTasksForUi(leafletTaskRows, leaflet.distributionDate || null).map(toLeafletTaskRow),
    [leafletTaskRows, leaflet.distributionDate],
  );
  const tasks = demo ? demoTasks : liveTasks;

  const { sponsorships: allSponsorships } = useAllSponsorships();
  const leafletSponsorships = useMemo(
    () => allSponsorships.filter((s) => s.leaflet_id === leafletId),
    [allSponsorships, leafletId],
  );

  const { levels: offeringLevels } = useSponsorshipItemOfferings({ leafletId: demo ? null : leafletId });
  const itemNameById = useMemo(
    () => new Map(offeringLevels.map((l) => [l.itemId, l.name])),
    [offeringLevels],
  );

  const { invoices: allStripeInvoices, refetch: refetchStripeInvoices } = useStripeInvoices();
  const leafletInvoiceRows = useMemo(
    () =>
      allStripeInvoices
        .filter((inv) => inv.leaflet_id === leafletId)
        .map((inv) => toLeafletInvoiceRow(inv, allSponsorships, itemNameById)),
    [allStripeInvoices, leafletId, allSponsorships, itemNameById],
  );

  const leafletRawRow = useMemo(() => leaflets.find((l) => l.id === leafletId), [leaflets, leafletId]);
  const budget = useMemo(() => {
    const raised = leafletSponsorships
      .filter((s) => s.status === "paid")
      .reduce((sum, s) => sum + (s.amount ?? 0), 0);
    const pledged = leafletSponsorships
      .filter((s) => s.status === "pledged")
      .reduce((sum, s) => sum + (s.amount ?? 0), 0);
    return buildEventBudget(
      leafletSponsorships,
      raised,
      pledged,
      (leafletRawRow as { sponsorship_goal_cents?: number | null } | undefined)?.sponsorship_goal_cents,
    );
  }, [leafletSponsorships, leafletRawRow]);
  const budgetSummary: LeafletBudgetSummary = {
    totalBudget: budget.goal,
    received: budget.raised,
    pending: budget.pledged,
  };

  const sponsorRows = useMemo(() => leafletSponsorships.map(toLeafletSponsorRow), [leafletSponsorships]);
  const pendingSponsorCount = sponsorRows.filter((s) => s.status !== "Confirmed").length;

  const { stories: leafletStoryRows } = useStories({ filters: { leafletId: leafletId || null } });
  const { people } = usePeople({ autoFetch: !demo });
  const authorNameById = useMemo(() => new Map(people.map((p) => [p.id, p.full_name])), [people]);
  const storyRows = useMemo(
    () => leafletStoryRows.map((row) => toLeafletStoryRow(row, authorNameById)),
    [leafletStoryRows, authorNameById],
  );

  const routeRows = useMemo(() => deliveriesToRouteRows(deliveries), [deliveries]);
  const openRouteRows = useMemo(() => routeRows.filter((r) => r.status === "unassigned"), [routeRows]);
  const skippedRouteRows = useMemo(() => routeRows.filter((r) => r.status === "skipped"), [routeRows]);

  const unresolvedRecipientCount = useMemo(() => {
    if (demo) return 8;
    return deliveries.filter((d) => d.person_id && d.response !== "confirmed").length;
  }, [demo, deliveries]);

  function changeView(next: LeafletDetailView) {
    setView(next);
    setSelection(null);
  }

  function selectRoute(row: LeafletRouteRow) {
    setSelection({ kind: "route", row });
  }

  function selectInvoice(row: LeafletSponsorshipInvoiceRow) {
    setSelection({ kind: "invoice", row });
  }

  function selectStory(row: LeafletStoryRow) {
    setSelection({ kind: "story", row });
  }

  function selectDeliverer(row: LeafletDelivererRow) {
    setSelection({ kind: "person", row });
  }

  function toggleTask(id: string) {
    if (demo) {
      void guard(async () => undefined, {
        action: "Task updated",
        local: () =>
          persistDemoTasks(
            demoTasks.map((task) =>
              task.id === id ? { ...task, isComplete: !task.isComplete } : task,
            ),
          ),
      });
      return;
    }
    const row = leafletTaskRows.find((t) => t.id === id);
    if (!row) return;
    void guard(() => toggleLeafletTaskComplete(row), { action: "Task updated" });
  }

  function addTask({ title, dueDate }: { title: string; dueDate: string }) {
    if (demo) {
      const group = leafletTaskGroupForDueDate(dueDate);
      const isOverdue = group === "Past due";
      void guard(async () => undefined, {
        action: "Task added",
        local: () =>
          persistDemoTasks([
            ...demoTasks,
            {
              id: `lf-task-${Date.now()}`,
              title,
              group,
              dueLabel: formatLeafletTaskDueLabel(dueDate, isOverdue),
              isComplete: false,
              isOverdue,
            },
          ]),
      });
      return;
    }
    void guard(
      async () => {
        const offset = leafletDaysOffsetFromAnchor(dueDate, leaflet.distributionDate || null);
        await createLeafletTaskMutation({ title, offset_days: offset, description: null });
      },
      { action: "Task added" },
    );
  }

  function removeTask(id: string) {
    if (demo) {
      void guard(async () => undefined, {
        action: "Task removed",
        local: () => persistDemoTasks(demoTasks.filter((task) => task.id !== id)),
      });
      return;
    }
    void guard(() => removeLeafletTaskMutation(id), { action: "Task removed" });
  }

  function downloadTopSheets() {
    const id = leaflet.id || leafletId;
    if (!id || id.startsWith("lf-")) {
      if (demo) {
        toast.success("Top sheets download — demo mode (no real file)");
        return;
      }
      toast.error("Leaflet id required to download top sheets");
      return;
    }
    window.open(
      `${getApiBase()}/api/leaflets/${encodeURIComponent(id)}/deliveries/cover-sheets`,
      "_blank",
    );
  }

  const body =
    view === "deliverers" ? (
      <LeafletDeliverersPage
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectDeliverer={selectDeliverer}
      />
    ) : view === "routes" ? (
      <LeafletRoutesPage
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectRoute={selectRoute}
      />
    ) : view === "sponsorships" ? (
      <LeafletSponsorshipsPage
        onSelectInvoice={selectInvoice}
        invoices={demo ? undefined : leafletInvoiceRows}
        budgetSummary={demo ? undefined : budgetSummary}
        leafletId={demo ? null : leafletId || leaflet.id}
      />
    ) : view === "schedule" ? (
      <LeafletSchedulePage
        tasks={tasks}
        onToggleTask={toggleTask}
        onAddTask={addTask}
        onRemoveTask={removeTask}
      />
    ) : (
      <LeafletOverviewPage
        leaflet={leaflet}
        tasks={tasks}
        onToggleTask={toggleTask}
        onSeeAllTasks={() => changeView("schedule")}
        onSeeAllOpenRoutes={() => changeView("routes")}
        onViewSponsorships={() => changeView("sponsorships")}
        onSelectOpenRoute={selectRoute}
        onSelectSkippedRoute={selectRoute}
        onSelectSponsor={() => changeView("sponsorships")}
        onSelectStory={selectStory}
        budgetSummary={demo ? undefined : budgetSummary}
        openRoutes={demo ? undefined : openRouteRows}
        skippedRoutes={demo ? undefined : skippedRouteRows}
        sponsors={demo ? undefined : sponsorRows}
        stories={demo ? undefined : storyRows}
        reminderDescription={
          demo
            ? undefined
            : pendingSponsorCount === 0
              ? "All sponsors are paid up."
              : `${pendingSponsorCount} sponsor${pendingSponsorCount === 1 ? "" : "s"} still owe${pendingSponsorCount === 1 ? "s" : ""} payment before this issue goes to print.`
        }
      />
    );

  const sideContentVisible = selection != null;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        isSideContentVisible={sideContentVisible}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "route" ? (
                <RouteDetailPanel route={selection.row} />
              ) : selection.kind === "invoice" ? (
                <LeafletInvoiceDetailPanel invoice={selection.row} onPaid={refetchStripeInvoices} />
              ) : selection.kind === "person" ? (
                <DelivererPersonPanel deliverer={selection.row} />
              ) : (
                <StoryDetailPanel story={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: leaflet.title,
              titleAdornment: <Badge label={statusLabel(leaflet.status)} />,
              hasFavorite: true,
              isFavorite: isFavorite(currentRoute),
              onFavoriteClick: () =>
                void toggleFavorite({ name: leaflet.title, route: currentRoute }),
              endContent:
                view === "deliverers" ? (
                  <>
                    <Button
                      label="Download Top Sheets"
                      variant="secondary"
                      icon={<Download size={14} strokeWidth={1.75} />}
                      onClick={downloadTopSheets}
                    />
                    <Button
                      label="Email deliverers"
                      variant="secondary"
                      icon={<Mail size={14} strokeWidth={1.75} />}
                      onClick={() => setEmailOpen(true)}
                    />
                  </>
                ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Leaflet views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Deliverers"
                  selected={view === "deliverers"}
                  onClick={() => changeView("deliverers")}
                />
                <ViewTab
                  label="Routes"
                  selected={view === "routes"}
                  onClick={() => changeView("routes")}
                />
                <ViewTab
                  label="Sponsorships"
                  selected={view === "sponsorships"}
                  onClick={() => changeView("sponsorships")}
                />
                <ViewTab
                  label="Tasks"
                  selected={view === "schedule"}
                  onClick={() => changeView("schedule")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <EmailDeliverersModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        leafletId={leafletId || leaflet.id}
        leafletTitle={leaflet.title}
        distributionDate={leaflet.distributionDate}
        recipientCount={unresolvedRecipientCount}
      />
    </div>
  );
}
