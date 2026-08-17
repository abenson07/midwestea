"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useEvent,
  useEvents,
  useEventSponsorships,
  useEventVolunteerAsks,
  useSponsorshipItemOfferings,
  useTasks,
  useDemoGuard,
  type VolunteerAskWithSignups,
} from "hooks";
import { getApiBase } from "@/lib/apiBase";
import {
  buildEventBudget,
  eventIdsForInvoiceFilter,
  isEventReadOnly,
  type EventEdition,
  type EventListItem,
} from "@/lib/events/eventData";
import { CURATED_DEMO_EVENT_IDS, eventMocksFor, type CuratedDemoEventId } from "@/data/mocks/events";
import {
  groupScheduleTasks,
  mapSponsors,
  mapTasksForUi,
} from "@/components/leaflet/leafletData";
import type { Invoice, Sponsor, SponsorshipTier, Task } from "@/components/leaflet/types";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";
import type { EventsUpdate, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";
import { newDemoId, patchDemoEntity, upsertDemoEntity } from "@/lib/demo/demoStore";

function isCuratedDemoEventId(id: string): id is CuratedDemoEventId {
  return (CURATED_DEMO_EVENT_IDS as readonly string[]).includes(id);
}

/** Fake `EventEdition` for a curated demo event id — real `useEvent()` returns null since these ids don't exist in the DB. */
function demoEventEdition(eventId: string): EventEdition | null {
  if (!isCuratedDemoEventId(eventId)) return null;
  const mocks = eventMocksFor(eventId);
  return {
    id: eventId,
    title: mocks.detail.title,
    starts_at: `${mocks.dateIso}T00:00:00.000Z`,
    ends_at: null,
    event_template_id: null,
    slug: eventId,
    fieldData: {
      location: mocks.detail.location,
      description: mocks.detail.description,
      status: "confirmed",
      kind: "council",
    },
    anchorDate: mocks.dateIso,
    distributionLabel: "",
    daysUntilLabel: "",
    status: "confirmed",
    kind: "council",
    publishStatus: "published",
  };
}

type EventBudget = ReturnType<typeof buildEventBudget>;

type ScheduleGroups = {
  active: ReturnType<typeof groupScheduleTasks>;
  completed: ReturnType<typeof groupScheduleTasks>;
};

type EventContextValue = {
  eventId: string;
  event: EventEdition | null;
  events: EventListItem[];
  readOnly: boolean;
  loading: boolean;
  error: string | null;
  tasks: Task[];
  tasksOpenTotal: number;
  toggleTask: (id: string) => void;
  createTask: (payload: {
    title: string;
    offset_days: number;
    description?: string | null;
  }) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  scheduleGroups: ScheduleGroups;
  volunteerAsks: VolunteerAskWithSignups[];
  volunteerSignupTotal: number;
  budget: EventBudget;
  sponsors: Sponsor[];
  sponsorshipTiers: SponsorshipTier[];
  sponsorshipTierSeeds: SponsorshipTierSeed[];
  invoices: Invoice[];
  createSponsorship: (
    payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">,
  ) => Promise<void>;
  updateSponsorship: (id: string, patch: SponsorshipsUpdate) => Promise<void>;
  saveSponsorshipTiers: (tiers: SponsorshipTierSeed[]) => Promise<void>;
  refetchAll: () => Promise<void>;
  updateEvent: (patch: EventsUpdate) => Promise<void>;
  publishEvent: () => Promise<void>;
  unpublishEvent: () => Promise<void>;
  uploadCoverImage: (file: File) => Promise<string>;
};

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const { events, loading: listLoading, error: listError } = useEvents();
  const {
    event: liveEvent,
    eventRow,
    loading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
    update,
    publish,
    unpublish,
    uploadCoverImage: uploadCoverImageReal,
  } = useEvent(eventId);
  const { enabled: demo } = useDemoGuard();

  const event = demo ? (demoEventEdition(eventId) ?? liveEvent) : liveEvent;

  const readOnly = eventRow ? isEventReadOnly(eventRow, event?.fieldData ?? {}) : false;

  const {
    tasks: taskRows,
    openCount,
    loading: tasksLoading,
    toggleComplete,
    createTask: createTaskMutation,
    remove: removeTaskMutation,
    refetch: refetchTasks,
  } = useTasks({
    context: "event",
    contextId: eventId,
    anchorDate: event?.anchorDate ?? null,
  });

  const {
    asks: volunteerAsks,
    volunteerSignupTotal,
    loading: volunteersLoading,
    error: volunteersError,
    refetch: refetchVolunteers,
  } = useEventVolunteerAsks(eventId);

  const {
    sponsorships,
    raised,
    pledgedAmount,
    loading: sponsorshipsLoading,
    error: sponsorshipsError,
    refetch: refetchSponsorships,
    createSponsorship: createSponsorshipMutation,
    updateSponsorship: updateSponsorshipMutation,
  } = useEventSponsorships(eventId);

  const {
    levels: offeringLevels,
    tierSeeds: sponsorshipTierSeeds,
    refetch: refetchOfferings,
    saveTiers: saveSponsorshipTiersMutation,
  } = useSponsorshipItemOfferings({ eventId });

  const invoiceFilterIds = useMemo(
    () => eventIdsForInvoiceFilter(eventId, event?.fieldData ?? {}),
    [eventId, event?.fieldData],
  );

  const invoicesQuery = useQuery({
    queryKey: ["event-invoices", eventId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
      const data = (await res.json()) as {
        error?: string;
        invoices?: Array<{
          id: string;
          number: string | null;
          status: string | null;
          customer_email: string | null;
          amount_due: number;
          due_date: number | null;
          event_id: string | null;
          sponsorship_id: string | null;
        }>;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load invoices");
      return data.invoices ?? [];
    },
    enabled: Boolean(eventId),
  });

  const tasks = useMemo(
    () => mapTasksForUi(taskRows, event?.anchorDate ?? null),
    [taskRows, event?.anchorDate],
  );

  const scheduleGroups = useMemo(
    (): ScheduleGroups => ({
      active: groupScheduleTasks(tasks, "active"),
      completed: groupScheduleTasks(tasks, "complete"),
    }),
    [tasks],
  );

  const sponsorRows = useMemo(
    () => sponsorships.filter((s) => s.business_id != null),
    [sponsorships],
  );

  const sponsors = useMemo(
    () => mapSponsors(sponsorRows, sponsorshipTierSeeds),
    [sponsorRows, sponsorshipTierSeeds],
  );

  const sponsorshipTiers = useMemo(
    (): SponsorshipTier[] =>
      offeringLevels.map((l) => {
        const remaining = Math.max(0, l.quantityAvailable - l.quantityFilled);
        return {
          name: l.name,
          amount: l.amount,
          quantity: l.quantityAvailable,
          left: remaining <= 0 ? "Sold out" : `${remaining} Remaining`,
          remaining,
          itemId: l.itemId,
        };
      }),
    [offeringLevels],
  );

  const invoices = useMemo((): Invoice[] => {
    const rows = (invoicesQuery.data ?? []).filter(
      (i) => i.event_id && invoiceFilterIds.includes(i.event_id),
    );
    const itemNameById = new Map(sponsorshipTiers.filter((t) => t.itemId).map((t) => [t.itemId, t.name]));
    return rows.map((inv) => {
      const sponsorship = inv.sponsorship_id
        ? sponsorships.find((s) => s.id === inv.sponsorship_id)
        : undefined;
      const level =
        (sponsorship?.sponsorship_item_id && itemNameById.get(sponsorship.sponsorship_item_id)) || "—";
      return {
        id: inv.id,
        invoice: inv.number ?? inv.id.slice(-8),
        sponsor: inv.customer_email ?? "—",
        amount: inv.amount_due / 100,
        dueDate: inv.due_date
          ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        status:
          inv.status === "paid"
            ? "Paid"
            : inv.status === "open"
              ? "Sent"
              : inv.status === "draft"
                ? "Draft"
                : inv.status === "uncollectible"
                  ? "Overdue"
                  : (inv.status ?? "Draft"),
        level,
      };
    });
  }, [invoicesQuery.data, invoiceFilterIds, sponsorships, sponsorshipTiers]);

  const budget = useMemo(
    () =>
      buildEventBudget(
        sponsorships,
        raised,
        pledgedAmount,
        event?.fieldData.sponsorship_goal_cents,
      ),
    [sponsorships, raised, pledgedAmount, event?.fieldData.sponsorship_goal_cents],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const row = taskRows.find((t) => t.id === taskId);
      if (!row || readOnly) return;
      await toggleComplete(row);
    },
    [taskRows, readOnly, toggleComplete],
  );

  const createTask = useCallback(
    async (payload: {
      title: string;
      offset_days: number;
      description?: string | null;
    }) => {
      if (readOnly) throw new Error("Event is read-only");
      await createTaskMutation(payload);
    },
    [readOnly, createTaskMutation],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (readOnly) throw new Error("Event is read-only");
      await removeTaskMutation(taskId);
    },
    [readOnly, removeTaskMutation],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchEvent(),
      refetchTasks(),
      refetchVolunteers(),
      refetchSponsorships(),
      invoicesQuery.refetch(),
    ]);
  }, [refetchEvent, refetchTasks, refetchVolunteers, refetchSponsorships, invoicesQuery]);

  const createSponsorship = useCallback(
    async (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => {
      if (readOnly) throw new Error("Event is read-only");
      if (demo) {
        upsertDemoEntity("sponsorships", {
          id: newDemoId("spon"),
          event_id: eventId,
          ...payload,
        });
        toast.success("Sponsorship created — demo mode, saved locally only");
        return;
      }
      await createSponsorshipMutation(payload);
    },
    [readOnly, demo, createSponsorshipMutation, eventId],
  );

  const updateSponsorship = useCallback(
    async (id: string, patch: SponsorshipsUpdate) => {
      if (readOnly) throw new Error("Event is read-only");
      if (demo) {
        patchDemoEntity("sponsorships", id, patch as Record<string, unknown>);
        toast.success("Sponsorship updated — demo mode, saved locally only");
        return;
      }
      await updateSponsorshipMutation(id, patch);
    },
    [readOnly, demo, updateSponsorshipMutation],
  );

  const saveSponsorshipTiers = useCallback(
    async (tiers: SponsorshipTierSeed[]) => {
      if (readOnly) throw new Error("Event is read-only");
      if (demo) {
        upsertDemoEntity("events", {
          id: `tiers-${eventId}`,
          event_id: eventId,
          tiers: tiers as unknown as Record<string, unknown>[],
        });
        toast.success("Sponsorship levels updated — demo mode, saved locally only");
        return;
      }
      await saveSponsorshipTiersMutation(tiers);
    },
    [readOnly, demo, saveSponsorshipTiersMutation, eventId],
  );

  const updateEvent = useCallback(
    async (patch: EventsUpdate) => {
      if (readOnly) throw new Error("Event is read-only");
      if (demo) {
        patchDemoEntity("events", eventId, patch as Record<string, unknown>);
        toast.success("Event updated — demo mode, saved locally only");
        return;
      }
      await update(patch);
    },
    [readOnly, demo, update, eventId],
  );

  const publishEvent = useCallback(async () => {
    if (demo) {
      patchDemoEntity("events", eventId, { publishStatus: "published", publish_status: "published" });
      toast.success("Event published — demo mode, saved locally only");
      return;
    }
    await publish();
  }, [demo, publish, eventId]);

  const unpublishEvent = useCallback(async () => {
    if (demo) {
      patchDemoEntity("events", eventId, { publishStatus: "draft", publish_status: "draft" });
      toast.success("Event unpublished — demo mode, saved locally only");
      return;
    }
    await unpublish();
  }, [demo, unpublish, eventId]);

  const uploadCoverImage = useCallback(
    async (file: File) => {
      if (demo) {
        const url = URL.createObjectURL(file);
        patchDemoEntity("events", eventId, { cover_image_url: url });
        toast.success("Cover image updated — demo mode, saved locally only");
        return url;
      }
      return uploadCoverImageReal(file);
    },
    [demo, uploadCoverImageReal, eventId],
  );

  const loading =
    listLoading ||
    eventLoading ||
    tasksLoading ||
    volunteersLoading ||
    sponsorshipsLoading ||
    invoicesQuery.isLoading;

  const error =
    listError ??
    eventError ??
    volunteersError ??
    sponsorshipsError ??
    (invoicesQuery.error instanceof Error ? invoicesQuery.error.message : null);

  const value = useMemo(
    (): EventContextValue => ({
      eventId,
      event,
      events,
      readOnly,
      loading,
      error,
      tasks,
      tasksOpenTotal: openCount,
      toggleTask,
      createTask,
      removeTask,
      scheduleGroups,
      volunteerAsks,
      volunteerSignupTotal,
      budget,
      sponsors,
      sponsorshipTiers,
      sponsorshipTierSeeds,
      invoices,
      createSponsorship,
      updateSponsorship,
      saveSponsorshipTiers,
      refetchAll,
      updateEvent,
      publishEvent,
      unpublishEvent,
      uploadCoverImage,
    }),
    [
      eventId,
      event,
      events,
      readOnly,
      loading,
      error,
      tasks,
      openCount,
      toggleTask,
      createTask,
      removeTask,
      scheduleGroups,
      volunteerAsks,
      volunteerSignupTotal,
      budget,
      sponsors,
      sponsorshipTiers,
      sponsorshipTierSeeds,
      invoices,
      createSponsorship,
      updateSponsorship,
      saveSponsorshipTiers,
      refetchAll,
      updateEvent,
      publishEvent,
      unpublishEvent,
      uploadCoverImage,
    ],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventContext(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error("useEventContext must be used within EventProvider");
  }
  return ctx;
}
