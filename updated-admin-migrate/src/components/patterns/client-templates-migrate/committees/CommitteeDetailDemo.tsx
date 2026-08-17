"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { CommitteeDetailPage } from "./CommitteeDetailPage";
import { CommitteeEventsPage } from "./CommitteeEventsPage";
import { CommitteeInitiativesPage } from "./CommitteeInitiativesPage";
import { CommitteeSettingsPage } from "./CommitteeSettingsPage";
import { ScheduleCommitteeMeetingModal } from "./ScheduleCommitteeMeetingModal";
import { resolveCommitteeSlug } from "./committeeSlug";
import {
  sampleCommitteeDetail,
  sampleCommitteeMembers,
  sampleCommittees,
  sampleInitiatives,
  type CommitteeDetail,
  type CommitteeInitiative,
  type CommitteeMemberRow,
  type CommitteeMemberTitle,
} from "@/data/mocks/committees";
import { listDemoInitiatives, upsertDemoInitiative } from "@/lib/demo/demoInitiatives";
import {
  listDemoScoped,
  newDemoId,
  upsertDemoEntity,
  writeDemoScoped,
} from "@/lib/demo/demoStore";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { NewEventModal } from "@/components/patterns/client-templates-migrate/events/NewEventModal";
import type { EventSummary } from "@/data/mocks/events";
import {
  mapProfileToDetail,
  useCommitteeInitiatives,
  useCommitteeMembers,
  useCommitteeProfile,
  useDemoGuard,
  useEvents,
  useFavorites,
} from "hooks";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";

type CommitteeView = "overview" | "events" | "initiatives" | "settings";

function isCommitteeView(value: string | null): value is CommitteeView {
  return (
    value === "overview" ||
    value === "events" ||
    value === "initiatives" ||
    value === "settings"
  );
}

function buildCommitteeDetail(
  slug: CommitteeSlug,
  rawId: string,
  demo: boolean,
): CommitteeDetail {
  const fromSample = demo
    ? sampleCommittees.find((c) => c.id === rawId || c.id === slug)
    : undefined;
  return {
    id: rawId,
    name: fromSample?.name ?? `${COMMITTEE_LABELS[slug]} Committee`,
    chair: fromSample?.chair ?? "—",
    memberCount: fromSample?.memberCount ?? 0,
    cadence: fromSample?.cadence ?? (demo ? "Monthly" : "Ongoing"),
    description:
      fromSample?.description ??
      `Meetings, agenda, minutes, and action items for the ${COMMITTEE_LABELS[slug]} committee.`,
    meetingDay: demo ? sampleCommitteeDetail.meetingDay : "—",
    location: demo ? sampleCommitteeDetail.location : "—",
    founded: demo ? sampleCommitteeDetail.founded : "—",
    websiteSlug: demo ? (sampleCommitteeDetail.websiteSlug ?? slug) : slug,
    publishStatus: demo ? (sampleCommitteeDetail.publishStatus ?? "published") : "draft",
  };
}

export function CommitteeDetailDemo() {
  const params = useParams<{ committeeId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabled: demo } = useDemoModeOptional();
  const { guard } = useDemoGuard();
  const { create: createEvent } = useEvents({ autoFetch: false });
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentRoute = normalizeRoute(
    searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname,
  );
  const rawId = typeof params?.committeeId === "string" ? params.committeeId : "events";
  const slug = resolveCommitteeSlug(rawId);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [view, setView] = useState<CommitteeView>("overview");
  const [demoInitiatives, setDemoInitiatives] = useState<CommitteeInitiative[]>(() =>
    sampleInitiatives.map((i) => ({ ...i, tasks: i.tasks.map((t) => ({ ...t })) })),
  );
  const [profileDraft, setProfileDraft] = useState<CommitteeDetail | null>(null);
  const [demoMembers, setDemoMembers] = useState<CommitteeMemberRow[]>(() =>
    sampleCommitteeMembers.map((m) => ({ ...m })),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!demo || !slug) return;
    const stored = listDemoScoped<CommitteeMemberRow>("committeeMembers", slug);
    if (stored) setDemoMembers(stored);
  }, [demo, slug]);

  function persistDemoMembers(next: CommitteeMemberRow[]) {
    setDemoMembers(next);
    if (slug) writeDemoScoped("committeeMembers", slug, next);
  }

  const {
    initiatives: liveInitiatives,
    loading: initiativesLoading,
    createInitiative,
  } = useCommitteeInitiatives(slug && !demo ? slug : null);

  useEffect(() => {
    if (!demo) return;
    const extras = listDemoInitiatives();
    if (extras.length === 0) return;
    setDemoInitiatives((prev) => {
      const known = new Set(prev.map((i) => i.id));
      const missing = extras.filter((i) => !known.has(i.id));
      return missing.length === 0 ? prev : [...missing, ...prev];
    });
  }, [demo]);

  const baseDetail = useMemo(
    () => (slug ? buildCommitteeDetail(slug, rawId, demo) : null),
    [slug, rawId, demo],
  );

  const { profile: liveProfileRow, saveProfile } = useCommitteeProfile(
    slug && !demo ? slug : null,
  );

  const {
    members: liveMembers,
    addMember,
    updateMemberTitle,
    removeMember,
  } = useCommitteeMembers(slug && !demo ? slug : null);

  const resolvedFromServer = useMemo(() => {
    if (!baseDetail) return null;
    if (demo) return baseDetail;
    return mapProfileToDetail(liveProfileRow, baseDetail);
  }, [baseDetail, demo, liveProfileRow]);

  // Keep an editable draft in sync with server/demo base when not dirtying settings
  useEffect(() => {
    if (!resolvedFromServer) return;
    setProfileDraft((prev) => {
      if (!prev) return { ...resolvedFromServer };
      // Re-sync when switching committees or after live profile fetch
      if (prev.id !== resolvedFromServer.id) return { ...resolvedFromServer };
      return prev;
    });
  }, [resolvedFromServer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const v = search.get("view");
    if (isCommitteeView(v)) setView(v);
  }, []);

  // When live profile arrives, refresh draft from server if user isn't mid-edit on settings
  useEffect(() => {
    if (demo || !resolvedFromServer || view === "settings") return;
    setProfileDraft({ ...resolvedFromServer });
  }, [demo, resolvedFromServer, view, liveProfileRow]);

  const committee = profileDraft ?? resolvedFromServer;
  const members = demo ? demoMembers : liveMembers;

  const initiatives = useMemo(() => {
    if (!slug) return [];
    if (demo) return demoInitiatives.filter((i) => i.committee === slug);
    return liveInitiatives;
  }, [demo, demoInitiatives, liveInitiatives, slug]);

  function changeView(next: CommitteeView) {
    setView(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState({}, "", url.toString());
  }

  function goToMeeting(meetingId: string) {
    router.push(
      `/admin-preview/committees/${encodeURIComponent(rawId)}/meetings/${encodeURIComponent(meetingId)}`,
    );
  }

  async function handleAddInitiative() {
    if (!slug) return;
    const title = "Untitled initiative";
    if (demo) {
      const initiative: CommitteeInitiative = {
        id: `demo-init-${slug}-${Date.now()}`,
        committee: slug,
        title,
        description: "",
        tasks: [],
      };
      upsertDemoInitiative(initiative);
      setDemoInitiatives((prev) => [initiative, ...prev]);
      await guard(async () => undefined, { action: "Initiative created" });
      router.push(
        `/admin-preview/committees/${encodeURIComponent(rawId)}/initiatives/${encodeURIComponent(initiative.id)}`,
      );
      return;
    }
    setBusy(true);
    try {
      const created = await createInitiative({ title });
      router.push(
        `/admin-preview/committees/${encodeURIComponent(rawId)}/initiatives/${encodeURIComponent(created.id)}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create initiative");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateEvent(event: Omit<EventSummary, "id">) {
    if (!slug) return;
    if (demo) {
      const id = newDemoId("evt");
      await guard(async () => undefined, {
        action: "Event created",
        local: () => {
          upsertDemoEntity("events", {
            id,
            title: event.title,
            date: event.date,
            location: event.location,
            committee: event.committee || slug,
            description: event.description,
          });
        },
      });
      router.push(`/admin-preview/events/${id}`);
      return;
    }
    const startsAt = event.date
      ? new Date(`${event.date}T00:00:00`).toISOString()
      : new Date().toISOString();
    try {
      const created = await createEvent({
        name: event.title,
        starts_at: startsAt,
        committee: event.committee || slug,
        field_data: {
          location: event.location,
          description: event.description,
          committee: event.committee || slug,
          kind: "council",
        },
      });
      if (created) router.push(`/admin-preview/events/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    }
  }

  async function handleSaveProfile() {
    if (!committee || !slug) return;
    setBusy(true);
    try {
      if (demo) {
        await guard(async () => undefined, {
          action: "Committee settings saved",
          local: () => {
            upsertDemoEntity("accountSettings", {
              ...committee,
              id: `committee-${slug}`,
            });
          },
        });
        return;
      }
      await saveProfile({
        name: committee.name,
        description: committee.description,
        cadence: committee.cadence,
        meeting_day: committee.meetingDay,
        location: committee.location,
        website_slug: committee.websiteSlug ?? null,
        publish_status: committee.publishStatus ?? "draft",
      });
      toast.success("Committee settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handleTogglePublish() {
    if (!committee) return;
    const next = committee.publishStatus === "published" ? "draft" : "published";
    setBusy(true);
    try {
      setProfileDraft((prev) => (prev ? { ...prev, publishStatus: next } : prev));
      if (demo) {
        await guard(async () => undefined, {
          action: next === "published" ? "Committee published" : "Committee unpublished",
          local: () => {
            upsertDemoEntity("accountSettings", {
              ...(committee ?? {}),
              id: `committee-${slug}`,
              publishStatus: next,
            });
          },
        });
        return;
      }
      await saveProfile({
        name: committee.name,
        description: committee.description,
        cadence: committee.cadence,
        meeting_day: committee.meetingDay,
        location: committee.location,
        website_slug: committee.websiteSlug ?? null,
        publish_status: next,
      });
      toast.success(next === "published" ? "Committee published" : "Committee unpublished");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update publish status");
    } finally {
      setBusy(false);
    }
  }

  async function handleChangeMemberTitle(memberId: string, title: CommitteeMemberTitle) {
    if (demo) {
      const next = demoMembers.map((m) => (m.id === memberId ? { ...m, role: title } : m));
      await guard(async () => undefined, {
        action: "Member title updated",
        local: () => persistDemoMembers(next),
      });
      return;
    }
    await updateMemberTitle(memberId, title);
  }

  async function handleRemoveMember(memberId: string) {
    if (demo) {
      const next = demoMembers.filter((m) => m.id !== memberId);
      await guard(async () => undefined, {
        action: "Member removed",
        local: () => persistDemoMembers(next),
      });
      return;
    }
    await removeMember(memberId);
  }

  async function handleAddMember(person: { id: string; name: string; email: string }) {
    if (demo) {
      await guard(async () => undefined, {
        action: "Member added",
        local: () => {
          if (demoMembers.some((m) => (m.personId ?? m.id) === person.id)) return;
          persistDemoMembers([
            ...demoMembers,
            {
              id: `demo-${person.id}`,
              personId: person.id,
              name: person.name,
              email: person.email,
              role: "Member",
            },
          ]);
        },
      });
      return;
    }
    await addMember(person.id, "Member");
  }

  if (!slug || !committee) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          contentMaxWidth={1200}
          header={<CanvasHeader topbar={{ title: "Committee" }} />}
        >
          <div style={{ padding: 32 }}>
            <Text color="secondary">Unknown committee: {rawId}</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  const body =
    view === "events" ? (
      <CommitteeEventsPage
        committeeSlug={slug}
        onScheduleMeeting={() => setScheduleOpen(true)}
        onSelectMeeting={goToMeeting}
        onAddEvent={() => setNewEventOpen(true)}
      />
    ) : view === "initiatives" ? (
      <CommitteeInitiativesPage
        initiatives={initiatives}
        loading={!demo && initiativesLoading}
        onAddInitiative={() => void handleAddInitiative()}
        onSelectInitiative={(initiativeId) => {
          router.push(
            `/admin-preview/committees/${encodeURIComponent(rawId)}/initiatives/${encodeURIComponent(initiativeId)}`,
          );
        }}
      />
    ) : view === "settings" ? (
      <CommitteeSettingsPage
        committeeSlug={slug}
        profile={committee}
        members={members}
        busy={busy}
        onProfileFieldChange={(patch) => {
          setProfileDraft((prev) => (prev ? { ...prev, ...patch } : prev));
        }}
        onSaveProfile={handleSaveProfile}
        onTogglePublish={handleTogglePublish}
        onChangeMemberTitle={handleChangeMemberTitle}
        onRemoveMember={handleRemoveMember}
        onAddMember={handleAddMember}
      />
    ) : (
      <CommitteeDetailPage
        committee={committee}
        committeeSlug={slug}
        members={members}
        onSelectMeeting={goToMeeting}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: committee.name,
              titleAdornment: (
                <Badge
                  label={
                    committee.publishStatus === "draft" ? "Draft" : committee.cadence
                  }
                />
              ),
              hasFavorite: true,
              isFavorite: isFavorite(currentRoute),
              onFavoriteClick: () =>
                void toggleFavorite({ name: committee.name, route: currentRoute }),
              breadcrumbs: [
                {
                  label: "Committees",
                  onClick: () => router.push("/admin-preview/committees"),
                },
              ],
              endContent:
                view === "initiatives" ? (
                  <Button
                    label="Add new initiative"
                    variant="secondary"
                    icon={<Plus size={14} strokeWidth={1.75} />}
                    disabled={busy}
                    onClick={() => void handleAddInitiative()}
                  />
                ) : view === "events" ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Button
                      label="New committee meeting"
                      variant="secondary"
                      onClick={() => setScheduleOpen(true)}
                    />
                    <Button
                      label="New event"
                      variant="secondary"
                      icon={<Plus size={14} strokeWidth={1.75} />}
                      onClick={() => setNewEventOpen(true)}
                    />
                  </div>
                ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Committee views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Events"
                  selected={view === "events"}
                  onClick={() => changeView("events")}
                />
                <ViewTab
                  label="Initiatives"
                  selected={view === "initiatives"}
                  onClick={() => changeView("initiatives")}
                />
                <ViewTab
                  label="Settings"
                  selected={view === "settings"}
                  onClick={() => changeView("settings")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <ScheduleCommitteeMeetingModal
        isOpen={scheduleOpen}
        committee={slug}
        onClose={() => setScheduleOpen(false)}
        onCreated={(meeting) => {
          router.push(
            `/admin-preview/committees/${encodeURIComponent(rawId)}/meetings/${encodeURIComponent(meeting.id)}`,
          );
        }}
      />

      <NewEventModal
        isOpen={newEventOpen}
        onClose={() => setNewEventOpen(false)}
        defaultCommittee={slug ?? "events"}
        committeeLocked
        onCreate={(event) => {
          void handleCreateEvent(event);
        }}
      />
    </div>
  );
}
