import { taskDueDate } from "hooks";
import type { DeliveryWithRelations } from "hooks";
import type {
  CommSettings,
  Deliveries,
  Leaflets,
  People,
  Routes,
  Sponsorships,
  Tasks,
} from "@/types/database";
import {
  defaultSponsorshipTierSeeds,
  isSponsorshipTierPlaceholder,
  resolveSponsorshipTierSeeds,
  type SponsorshipTierSeed,
} from "@/lib/sponsorship/tierPlaceholders";
import type {
  CommStage,
  DelivererCard,
  OpenRoutePreview,
  ScheduleGroupLabel,
  Sponsor,
  Substitution,
  Task,
} from "./types";
import { openRoutesTableStatusLabel } from "./deliveryUtils";

export type RouteWithPrimaryDeliverer = Routes & {
  primary_deliverer?: People | null;
};

export type DeliveryWithRoutePrimary = DeliveryWithRelations & {
  routes?: RouteWithPrimaryDeliverer | null;
};

export function formatDistributionDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function defaultSponsorshipDueDate(distributionDate: string): string {
  const d = new Date(`${distributionDate}T12:00:00`);
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function defaultDeliveryDate(distributionDate: string): string {
  const d = new Date(`${distributionDate}T12:00:00`);
  d.setDate(d.getDate() - 21);
  return d.toISOString().slice(0, 10);
}

export function daysUntilDistribution(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days since distribution`;
  if (diff === 0) return "Distribution is today";
  return `${diff} days until distribution`;
}

export const SCHEDULE_GROUP_ORDER: ScheduleGroupLabel[] = [
  "Past due",
  "Six months out",
  "90 days out",
  "60 days out",
  "30 days out",
  "2 weeks out",
  "Week of event",
  "Day of event",
];

export function scheduleGroupForOffset(offsetDays: number): Exclude<ScheduleGroupLabel, "Past due"> {
  if (offsetDays >= 0) return "Day of event";
  const daysBefore = -offsetDays;
  if (daysBefore <= 7) return "Week of event";
  if (daysBefore <= 14) return "2 weeks out";
  if (daysBefore <= 30) return "30 days out";
  if (daysBefore <= 60) return "60 days out";
  if (daysBefore <= 90) return "90 days out";
  return "Six months out";
}

function formatTaskDueLabel(
  t: Tasks,
  due: Date | null,
  isOverdue: boolean,
): string {
  if (t.is_complete && t.completed_at) {
    return `Completed ${new Date(t.completed_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }
  if (!due) return "";
  const dueStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return isOverdue ? `Due ${dueStr} — overdue` : `Due ${dueStr}`;
}

export function mapTasksForUi(tasks: Tasks[], distributionDate: string | null): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.map((t) => {
    const due = distributionDate ? taskDueDate(distributionDate, t.offset_days) : null;
    const isOverdue = Boolean(due && !t.is_complete && due.getTime() < today.getTime());
    return {
      id: t.id,
      title: t.title,
      offset_days: t.offset_days,
      is_complete: t.is_complete,
      is_skipped: t.is_skipped,
      template_id: t.template_id,
      group: isOverdue ? "Past due" : scheduleGroupForOffset(t.offset_days),
      dueLabel: formatTaskDueLabel(t, due, isOverdue),
      isOverdue,
    };
  });
}

export function groupScheduleTasks(tasks: Task[], mode: "active" | "complete" | "skipped") {
  const filtered = tasks.filter((t) =>
    mode === "skipped"
      ? t.is_skipped
      : mode === "complete"
        ? t.is_complete && !t.is_skipped
        : !t.is_complete && !t.is_skipped,
  );
  const groups = new Map<ScheduleGroupLabel, Task[]>();

  for (const task of filtered) {
    const label: ScheduleGroupLabel =
      mode === "active" ? (task.group as ScheduleGroupLabel) : scheduleGroupForOffset(task.offset_days);
    const list = groups.get(label) ?? [];
    list.push(task);
    groups.set(label, list);
  }

  const order = mode === "active" ? SCHEDULE_GROUP_ORDER : SCHEDULE_GROUP_ORDER.filter((g) => g !== "Past due");

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, tasks: groups.get(label)! }));
}

export function buildOpenRoutePreviews(deliveries: DeliveryWithRelations[]): OpenRoutePreview[] {
  return deliveries
    .filter((d) => !d.person_id || d.is_skipped)
    .slice(0, 4)
    .map((d) => {
      const initials = (d.people?.full_name ?? d.routes?.route_name ?? "?")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const households =
        d.leaflet_count != null ? `${d.leaflet_count} households` : "— households";
      let detail = `${households} · no deliverer`;
      if (d.is_skipped) detail = `${households} · substitution needed`;
      return {
        id: d.id,
        initials,
        name: d.routes?.route_name ?? "Open route",
        detail,
        dot: d.is_skipped ? ("amber" as const) : ("green" as const),
      };
    });
}

export function buildDelivererCards(deliveries: DeliveryWithRelations[]): DelivererCard[] {
  const byPerson = new Map<string, { person: People; rows: DeliveryWithRelations[] }>();
  for (const d of deliveries) {
    if (!d.person_id || !d.people) continue;
    const existing = byPerson.get(d.person_id);
    if (existing) existing.rows.push(d);
    else byPerson.set(d.person_id, { person: d.people, rows: [d] });
  }

  return Array.from(byPerson.values())
    .sort((a, b) => a.person.full_name.localeCompare(b.person.full_name))
    .map(({ person, rows }) => {
      const allConfirmed = rows.every((r) => r.response === "confirmed");
      return {
        id: person.id,
        name: person.full_name,
        email: person.email ?? "",
        address: person.address ?? null,
        status: allConfirmed ? ("Confirmed" as const) : ("Not confirmed" as const),
        routes: rows.map((r) => ({
          name: r.routes?.route_name ?? "—",
          households:
            r.leaflet_count != null ? `${r.leaflet_count} leaflets` : "— leaflets",
          leafletCount: r.leaflet_count ?? null,
          deliveryId: r.id,
          routeId: r.route_id,
          isSkipped: r.is_skipped,
        })),
      };
    });
}

export function buildSubstitutions(deliveries: DeliveryWithRoutePrimary[]): Substitution[] {
  return deliveries
    .filter((d) => d.is_skipped)
    .map((d) => {
      const route = d.routes;
      const forPerson = route?.primary_deliverer?.full_name ?? "—";
      const covering = d.people?.full_name ?? "Unassigned";
      return {
        id: d.id,
        deliveryId: d.id,
        route: route?.route_name ?? "—",
        covering,
        forPerson,
        date: d.responded_at
          ? new Date(d.responded_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        status:
          d.response === "confirmed"
            ? "Confirmed"
            : d.response === "needs_cover"
              ? "Pending"
              : "Scheduled",
        coveringEmail: d.people?.email ?? undefined,
        coveringPhone: d.people?.phone ?? undefined,
      };
    });
}

export function responseCounts(deliveries: DeliveryWithRelations[]) {
  let yes = 0;
  let skipped = 0;
  let removed = 0;
  let unresponsive = 0;

  for (const d of deliveries) {
    if (d.response === "confirmed") {
      yes++;
    } else if (d.response === "needs_cover" || d.is_skipped) {
      skipped++;
    } else if (d.response === "rejected") {
      removed++;
    } else if (d.person_id && d.response === "pending") {
      unresponsive++;
    }
  }

  return {
    yes,
    unresponsive,
    no: skipped + removed,
    noSkipped: skipped,
    noRemoved: removed,
  };
}

const LEAFLET_COMM_COLUMNS: Record<string, keyof Leaflets> = {
  initial_confirmation: "comm_initial_confirmation_sent_at",
  distribution_day_pickup: "comm_distribution_day_pickup_sent_at",
  delivery_complete_prompt: "comm_delivery_complete_prompt_sent_at",
};

const DELIVERY_COMM_COLUMNS: Record<string, keyof Deliveries> = {
  pre_distribution_reminder: "comm_pre_distribution_reminder_sent_at",
  completion_followup: "comm_completion_followup_sent_at",
};

export function buildCommStages(
  settings: CommSettings[],
  leaflet: Leaflets | null,
  deliveries: DeliveryWithRelations[],
): CommStage[] {
  const counts = responseCounts(deliveries);
  const recipientCount = deliveries.filter(
    (d) => d.person_id && d.people?.email,
  ).length;
  let foundActive = false;

  return settings.map((s, index) => {
    const leafletColumn = LEAFLET_COMM_COLUMNS[s.step_key];
    const deliveryColumn = DELIVERY_COMM_COLUMNS[s.step_key];
    const leafletSentAt =
      leaflet && leafletColumn
        ? (leaflet[leafletColumn] as string | null)
        : null;
    const deliverySentAt = deliveryColumn
      ? deliveries
          .filter((d) => d.person_id)
          .map((d) => d[deliveryColumn] as string | null)
      : [];
    const isCompleted = leafletColumn
      ? Boolean(leafletSentAt)
      : deliveryColumn
        ? deliverySentAt.length > 0 && deliverySentAt.every(Boolean)
        : false;
    const state: CommStage["state"] = isCompleted
      ? "completed"
      : !foundActive
        ? ((foundActive = true), "active")
        : "upcoming";

    const stage: CommStage = {
      id: s.id,
      stepKey: s.step_key,
      name: s.name,
      state,
    };

    if (state === "completed" && (leafletSentAt || deliveryColumn)) {
      const sentIso =
        leafletSentAt ??
        (deliverySentAt.find(Boolean) as string | undefined) ??
        null;
      if (sentIso) {
        stage.sentDate = new Date(sentIso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      stage.sentCount = recipientCount;
      if (s.step_key === "initial_confirmation") {
        stage.yes = counts.yes;
        stage.unresponsive = counts.unresponsive;
        stage.no = counts.no;
        stage.noSkipped = counts.noSkipped;
        stage.noRemoved = counts.noRemoved;
      }
    }

    if (state === "active" && s.requires_response) {
      stage.description =
        s.step_key === "initial_confirmation"
          ? "Ask deliverers to confirm their routes before distribution day."
          : s.name;
    }

    if (state === "active" || state === "upcoming") {
      if (s.offset_days != null) {
        stage.timing =
          s.offset_days < 0
            ? `Send in ${Math.abs(s.offset_days)} days`
            : s.offset_days > 0
              ? `Send in ${s.offset_days} days`
              : "Send on distribution day";
      } else if (state === "active") {
        stage.timing = "Send in today";
      }
      stage.description ??= s.name;
    }

    if (index === settings.length - 1 && state === "upcoming") {
      stage.description = "Last chance before routes are reassigned.";
    }

    return stage;
  });
}

export function buildDeliveryStats(deliveries: DeliveryWithRelations[]) {
  const openRoutes = deliveries.filter((d) => !d.person_id || d.is_skipped).length;
  const phoneDrops = deliveries.filter(
    (d) => d.building_contact_is_deliverer && d.building_contact_name,
  ).length;
  const skips = deliveries.filter((d) => d.is_skipped).length;
  const ejections = deliveries.filter((d) => d.response === "rejected").length;
  return { openRoutes, phoneDrops, skips, ejections };
}

export function buildTimeline(deliveries: DeliveryWithRelations[]) {
  const assigned = deliveries.filter((d) => d.person_id).length;
  const total = deliveries.length;
  const confirmed = deliveries.filter((d) => d.response === "confirmed").length;
  const complete = deliveries.filter((d) => d.date_delivered).length;

  return [
    {
      stage: "Deliverers Notified",
      counter: `${assigned} of ${total}`,
      status: assigned < total ? "In progress" : "Complete",
      active: assigned < total,
    },
    {
      stage: "Deliverers Confirmed",
      counter: `${confirmed} of ${assigned || total}`,
      status: confirmed < assigned ? "In progress" : "Complete",
      active: confirmed > 0 && confirmed < assigned,
    },
    {
      stage: "Delivery Complete",
      counter: `${complete} of ${total}`,
      status: complete > 0 ? "In progress" : "Pending",
      active: false,
    },
  ];
}

export function buildBudget(
  leaflet: Leaflets | null,
  sponsorships: Sponsorships[],
  raised: number,
  pledgedAmount: number,
) {
  const printBudget = (leaflet?.print_cost_cents ?? 480_000) / 100;
  const spent = 0;
  const goalFromField =
    leaflet?.sponsorship_goal_cents != null && leaflet.sponsorship_goal_cents > 0
      ? leaflet.sponsorship_goal_cents / 100
      : null;
  const actualSponsors = sponsorships.filter((s) => !isSponsorshipTierPlaceholder(s));
  const sponsorshipGoal =
    goalFromField ??
    (actualSponsors.reduce((sum, s) => sum + (s.amount ?? 0), 0) || 15_000);
  const remaining = Math.max(0, printBudget - spent);
  const progressPct = printBudget > 0 ? Math.round((spent / printBudget) * 100) : 0;
  const sponsorshipProgressPct =
    sponsorshipGoal > 0 ? Math.round((raised / sponsorshipGoal) * 100) : 0;
  const sponsorshipCommitted = raised + pledgedAmount;
  const membershipAmount = Math.max(0, sponsorshipGoal - sponsorshipCommitted);
  const sponsorshipPctOfGoal =
    sponsorshipGoal > 0 ? Math.round((sponsorshipCommitted / sponsorshipGoal) * 100) : 0;
  const membershipPctOfGoal =
    sponsorshipGoal > 0 ? Math.round((membershipAmount / sponsorshipGoal) * 100) : 0;

  return {
    printBudget,
    spent,
    remaining,
    progressPct,
    sponsorshipGoal,
    raised,
    pledged: pledgedAmount,
    sponsorshipProgressPct,
    sponsorshipCommitted,
    membershipAmount,
    sponsorshipPctOfGoal,
    membershipPctOfGoal,
  };
}

export function buildBudgetLineItems(leaflet: Leaflets | null) {
  const printCost = (leaflet?.print_cost_cents ?? 168_000) / 100;
  return [
    {
      name: "Printing",
      amount: `$${printCost.toLocaleString()}`,
      status: "Paid",
      statusTone: "paid" as const,
    },
    {
      name: "Delivery supplies",
      amount: "$420",
      status: "Pending",
      statusTone: "pending" as const,
    },
  ];
}

export const SPONSORSHIP_TIER_DEFS = defaultSponsorshipTierSeeds().map((tier) => ({
  name: tier.name,
  amount: tier.amount,
}));

export function buildSponsorshipTiers(sponsorships: Sponsorships[]) {
  const tiers = resolveSponsorshipTierSeeds(sponsorships);
  const actualSponsors = sponsorships.filter((s) => !isSponsorshipTierPlaceholder(s));

  return tiers.map((tier) => {
    const matchingSponsors = actualSponsors.filter((s) => s.amount === tier.amount);
    const taken = matchingSponsors.filter(
      (s) => s.status === "paid" || s.status === "pledged" || s.status === "invoiced",
    ).length;
    const remaining = Math.max(0, tier.quantity - taken);
    return {
      name: tier.name,
      amount: tier.amount,
      quantity: tier.quantity,
      left: remaining <= 0 ? "Sold out" : `${remaining} Remaining`,
      remaining,
    };
  });
}

export function mapSponsors(
  sponsorships: (Sponsorships & {
    businesses?: { business_name: string | null; email: string | null } | null;
  })[],
  tierSeedsOverride?: SponsorshipTierSeed[],
): Sponsor[] {
  const tierSeeds = tierSeedsOverride ?? resolveSponsorshipTierSeeds(sponsorships);
  return sponsorships.filter((s) => !isSponsorshipTierPlaceholder(s)).map((s) => ({
    id: s.id,
    business: s.businesses?.business_name ?? s.description ?? "—",
    contact: s.businesses?.email ?? s.memo ?? "—",
    level:
      tierSeeds.find((t) => t.amount === s.amount)?.name ??
      (s.amount != null ? `$${s.amount}` : "—"),
    amount: s.amount ?? 0,
    status:
      s.status === "paid"
        ? "Paid"
        : s.status === "pledged"
          ? "Pledged"
          : s.status === "invoiced"
            ? "Invoiced"
            : "Pledged",
  }));
}

export function countChangeMap(
  current: DeliveryWithRelations[],
  previous: DeliveryWithRelations[],
) {
  const prevByRoute = new Map(previous.map((d) => [d.route_id, d.leaflet_count]));
  return (routeId: string, currentCount: number | null | undefined) => {
    const prev = prevByRoute.get(routeId);
    if (prev == null || currentCount == null) return null;
    return currentCount - prev;
  };
}

export function buildNetLeafletCountChange(
  current: DeliveryWithRelations[],
  previous: DeliveryWithRelations[],
): number {
  const prevByRoute = new Map(previous.map((d) => [d.route_id, d.leaflet_count]));
  let total = 0;
  for (const d of current) {
    const prev = prevByRoute.get(d.route_id);
    if (prev != null && d.leaflet_count != null) total += d.leaflet_count - prev;
  }
  return total;
}

export function buildPastDeliverers(
  history: DeliveryWithRelations[],
  routeId: string,
  excludePersonId?: string | null,
) {
  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [];
  for (const d of history) {
    if (d.route_id !== routeId || !d.person_id || !d.people) continue;
    if (d.person_id === excludePersonId || seen.has(d.person_id)) continue;
    seen.add(d.person_id);
    result.push({ id: d.person_id, name: d.people.full_name });
  }
  return result;
}

export function buildDeliveryHistory(
  history: DeliveryWithRelations[],
  routeId: string,
) {
  return history
    .filter((d) => d.route_id === routeId && d.leaflet_count != null)
    .slice(0, 5)
    .map((d) => ({
      label: d.date_delivered
        ? new Date(d.date_delivered).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Edition",
      count: d.leaflet_count!,
    }));
}

export function unassignedOpenCount(deliveries: DeliveryWithRelations[]) {
  return deliveries.filter((d) => !d.person_id).length;
}

export function routeStatusLabel(d: DeliveryWithRelations) {
  return openRoutesTableStatusLabel(d);
}
