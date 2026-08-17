"use client";

import { Suspense, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  BookOpen,
  Bug,
  CalendarDays,
  FileText,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  Megaphone,
  FlaskConical,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Star,
  Stethoscope,
  Sun,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/patterns/shared/dropdown";
import { useEvents, useStories, useCurrentPerson, useFavorites } from "hooks";
import { getCurrentPersonId } from "@/lib/people/currentPerson";
import { clearDemoStore, newDemoId, upsertDemoEntity } from "@/lib/demo/demoStore";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { getBestMatchingHref } from "@/lib/nav/getBestMatchingHref";
import { AddPromotionModal } from "@/components/patterns/client-templates/events/AddPromotionModal";
import { NewEventModal } from "@/components/patterns/client-templates/events/NewEventModal";
import { NewStoryModal } from "@/components/patterns/client-templates/content/NewStoryModal";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import type { EventPromotionType, EventSummary } from "@/data/mocks/events";
import type { Story } from "@/data/mocks/content";
import {
  DemoModeCard,
  MenuItem,
  NavBottom,
  SidebarHeader,
  SidebarHeaderActions,
  SidebarIconButton,
  SidebarScrollArea,
  SidebarSection,
  TryButton,
  WorkspaceMenu,
} from "./sidebar";
import { useThemeMode } from "./ThemeContext";
import { useDemoModeOptional } from "./DemoModeContext";
import { useWipFeaturesOptional } from "./WipFeaturesContext";
import { DemoModeConfirmModal, type DemoModeConfirmModalTarget } from "./DemoModeConfirmModal";
import { ReportIssueModal } from "./ReportIssueModal";
import "./sidebar/sidebar.css";

type DemoItem = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Path relative to the active base (`/admin-preview` or `/admin`) — prefixed at render time. */
  path: string;
  /** Hidden on /admin unless the "Preview features in development" setting is on. */
  wip?: boolean;
};

const group1Items: DemoItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={16} strokeWidth={1.75} />,
    path: "/overview",
    wip: true,
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: <Inbox size={16} strokeWidth={1.75} />,
    path: "/inbox",
    wip: true,
  },
  {
    id: "students",
    label: "Students",
    icon: <UserRound size={16} strokeWidth={1.75} />,
    path: "/students",
    wip: true,
  },
  {
    id: "payments",
    label: "Transactions",
    icon: <Wallet size={16} strokeWidth={1.75} />,
    path: "/transactions",
  },
  {
    id: "programs",
    label: "Programs",
    icon: <GraduationCap size={16} strokeWidth={1.75} />,
    path: "/programs",
    wip: true,
  },
  {
    id: "courses",
    label: "Courses",
    icon: <BookOpen size={16} strokeWidth={1.75} />,
    path: "/courses",
    wip: true,
  },
];

const classItems: DemoItem[] = [
  {
    id: "open-class-a",
    label: "PARA-004",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/open-class-a",
    wip: true,
  },
  {
    id: "open-class-b",
    label: "EMT-003",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/open-class-b",
    wip: true,
  },
  {
    id: "emt-002",
    label: "EMT-002",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/class/emt-002",
    wip: true,
  },
  {
    id: "aemt-001",
    label: "AEMT-001",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/class/aemt-001",
    wip: true,
  },
  {
    id: "atcc-001",
    label: "ATCC-001",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/class/atcc-001",
    wip: true,
  },
  {
    id: "para-002",
    label: "PARA-002",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/class/para-002",
    wip: true,
  },
  {
    id: "para-003",
    label: "PARA-003",
    icon: <Box size={16} strokeWidth={1.75} />,
    path: "/class/para-003",
    wip: true,
  },
];

const classTypeItems: DemoItem[] = [
  {
    id: "acls",
    label: "ACLS",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/acls",
    wip: true,
  },
  {
    id: "avert",
    label: "AVERT",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/avert",
    wip: true,
  },
  {
    id: "bls",
    label: "BLS",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/bls",
    wip: true,
  },
  {
    id: "cabs",
    label: "CABS",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/cabs",
    wip: true,
  },
  {
    id: "cpr",
    label: "CPR",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/cpr",
    wip: true,
  },
  {
    id: "epi",
    label: "EPI",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/epi",
    wip: true,
  },
  {
    id: "oxy",
    label: "OXY",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/oxy",
    wip: true,
  },
  {
    id: "ped",
    label: "PALS",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/ped",
    wip: true,
  },
  {
    id: "path",
    label: "PATH",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/path",
    wip: true,
  },
  {
    id: "peds",
    label: "PEDS",
    icon: <Stethoscope size={16} strokeWidth={1.75} />,
    path: "/class/peds",
    wip: true,
  },
];

const allClassesItems: DemoItem[] = [
  {
    id: "all-classes",
    label: "All Classes",
    icon: <LayoutGrid size={16} strokeWidth={1.75} />,
    path: "/classes",
    wip: true,
  },
];

function AccountAvatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: "#5e6ad2",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#ffffff",
        fontSize: 9,
        fontWeight: 600,
      }}
    >
      {initials}
    </span>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Real-data create modals for /admin — split out so `useStories`/`useEvents`
 * (react-query hooks) are only ever mounted inside /admin's QueryClientProvider,
 * never inside admin-preview, which has none and must stay free of real Supabase calls.
 */
function MigrateCreateModals({
  isNewStoryOpen,
  onCloseNewStory,
  isNewEventOpen,
  onCloseNewEvent,
  hrefFor,
}: {
  isNewStoryOpen: boolean;
  onCloseNewStory: () => void;
  isNewEventOpen: boolean;
  onCloseNewEvent: () => void;
  hrefFor: (path: string) => string;
}) {
  const router = useRouter();
  const { create: createStory } = useStories({ autoFetch: false });
  const { create: createEvent } = useEvents({ autoFetch: false });
  const { enabled: demo } = useDemoModeOptional();

  async function handleCreateStory(story: Omit<Story, "id">) {
    if (demo) {
      const id = newDemoId("story");
      upsertDemoEntity("stories", {
        id,
        title: story.title,
        status: story.status,
        body: story.body || "",
        author: story.author,
      });
      toast.success("Story created — demo mode, saved locally only");
      router.push(hrefFor(`/content?view=stories&selected=${id}`));
      return;
    }
    const authorId = await getCurrentPersonId();
    const created = await createStory({
      title: story.title,
      author_id: authorId,
      status: story.status === "Published" ? "published" : "draft",
      body: story.body || "",
    });
    if (created) router.push(hrefFor(`/content?view=stories&selected=${created.id}`));
  }

  async function handleCreateEvent(event: Omit<EventSummary, "id">) {
    if (demo) {
      const id = newDemoId("evt");
      upsertDemoEntity("events", {
        id,
        title: event.title,
        date: event.date,
        location: event.location,
        committee: event.committee,
        description: event.description,
      });
      toast.success("Event created — demo mode, saved locally only");
      router.push(hrefFor(`/events/${id}`));
      return;
    }
    const startsAt = event.date ? new Date(`${event.date}T00:00:00`).toISOString() : new Date().toISOString();
    const created = await createEvent({
      name: event.title,
      starts_at: startsAt,
      committee: event.committee,
      field_data: {
        location: event.location,
        description: event.description,
        committee: event.committee,
        kind: "council",
      },
    });
    if (created) router.push(hrefFor(`/events/${created.id}`));
  }

  return (
    <>
      <NewStoryModal isOpen={isNewStoryOpen} onClose={onCloseNewStory} onCreate={handleCreateStory} />
      <NewEventModal isOpen={isNewEventOpen} onClose={onCloseNewEvent} onCreate={handleCreateEvent} />
    </>
  );
}

export type LinearSidebarProps = {
  onSettingsClick?: () => void;
};

type LinearSidebarFavorite = {
  id: string;
  name: string;
  /** Full route (includes basePath), as stored by useFavorites. */
  route: string;
};

/**
 * Linear-style sidebar composed from named sidebar primitives.
 *
 * Favorites are real, Supabase-backed data (`useFavorites`), but that hook
 * uses react-query — which only has a `QueryClientProvider` mounted under
 * `/admin`, not `/admin-preview` (a frozen pattern library). So real
 * favorites are fetched in this thin wrapper, gated to /admin, and
 * passed down as plain props to the presentational sidebar below — same
 * isolation approach as `MigrateCreateModals` for useEvents/useStories.
 */
export function LinearSidebar(props: LinearSidebarProps = {}) {
  return (
    <Suspense fallback={null}>
      <LinearSidebarInner {...props} />
    </Suspense>
  );
}

/**
 * Split out so `useSearchParams()` (used deep inside `LinearSidebarBase` for
 * active-route matching) is always covered by a Suspense boundary, regardless
 * of whether the ~40 call sites across admin-preview/admin remember to wrap
 * it themselves — this component is rendered on nearly every admin page, so
 * a missed wrapper anywhere fails static prerendering at build time.
 */
function LinearSidebarInner(props: LinearSidebarProps) {
  const basePath = useAdminBasePath();
  if (basePath === "/admin") {
    return <LinearSidebarWithFavorites {...props} />;
  }
  return <LinearSidebarBase {...props} favorites={[]} onRemoveFavorite={undefined} />;
}

function LinearSidebarWithFavorites(props: LinearSidebarProps) {
  const { favorites, removeFavorite } = useFavorites();
  return (
    <LinearSidebarBase
      {...props}
      favorites={favorites}
      onRemoveFavorite={(route: string) => void removeFavorite(route)}
    />
  );
}

function LinearSidebarBase({
  onSettingsClick,
  favorites,
  onRemoveFavorite,
}: LinearSidebarProps & {
  favorites: LinearSidebarFavorite[];
  onRemoveFavorite?: (route: string) => void;
}) {
  const { mode, toggle } = useThemeMode();
  const { enabled: demoEnabled, setEnabled: setDemoEnabled } = useDemoModeOptional();
  const { enabled: wipFeaturesEnabled } = useWipFeaturesOptional();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const basePath = useAdminBasePath();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [promotionModalType, setPromotionModalType] = useState<EventPromotionType | null>(null);
  const [demoTransition, setDemoTransition] = useState<DemoModeConfirmModalTarget | null>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const isMigrate = basePath === "/admin";
  const { person: currentPerson } = useCurrentPerson();
  const displayName = currentPerson?.full_name || "Kyle Brower";
  const initials = initialsFromName(displayName);
  // admin-preview is a frozen pattern library, not shipped as-is — only /admin
  // needs its WIP items (committees/inbox/overview) hidden until opted in.
  const showWipItems = !isMigrate || wipFeaturesEnabled;
  const hideInbox = basePath === "/new-admin-migrate";
  const visibleGroup1Items = (showWipItems
    ? group1Items
    : group1Items.filter((item) => !item.wip)
  ).filter((item) => !hideInbox || item.id !== "inbox");
  const visibleClassItems = showWipItems
    ? classItems
    : classItems.filter((item) => !item.wip);
  const visibleClassTypeItems = showWipItems
    ? classTypeItems
    : classTypeItems.filter((item) => !item.wip);
  const visibleAllClassesItems = showWipItems
    ? allClassesItems
    : allClassesItems.filter((item) => !item.wip);

  function requestDemoTransition(target: DemoModeConfirmModalTarget) {
    setDemoTransition(target);
  }

  function confirmDemoTransition() {
    if (demoTransition === "live") clearDemoStore();
    if (demoTransition) setDemoEnabled(demoTransition === "demo");
    setDemoTransition(null);
  }

  function hrefFor(path: string): string {
    return `${basePath}${path}`;
  }

  const currentRoute = useMemo(() => {
    const search = searchParams.toString();
    return normalizeRoute(search ? `${pathname}?${search}` : pathname);
  }, [pathname, searchParams]);

  const activeHref = useMemo(() => {
    const allHrefs = [
      ...visibleGroup1Items.map((item) => hrefFor(item.path)),
      ...visibleClassItems.map((item) => hrefFor(item.path)),
      ...visibleClassTypeItems.map((item) => hrefFor(item.path)),
      ...visibleAllClassesItems.map((item) => hrefFor(item.path)),
      ...favorites.map((favorite) => favorite.route),
    ];
    return getBestMatchingHref(currentRoute, allHrefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hrefFor/basePath change together; visible* items are stable module-level data
  }, [
    currentRoute,
    visibleGroup1Items,
    visibleClassItems,
    visibleClassTypeItems,
    visibleAllClassesItems,
    favorites,
    basePath,
  ]);

  function isSelected(path: string): boolean {
    return hrefFor(path) === activeHref;
  }

  // Top-level nav label for the active route (e.g. "Students") — the desktop /admin
  // pages don't render an <h1>, so this is the most reliable "what section is the user in"
  // signal available to the bug-report modal.
  const activeSectionLabel = useMemo(() => {
    const allItems = [
      ...visibleGroup1Items,
      ...visibleClassItems,
      ...visibleClassTypeItems,
      ...visibleAllClassesItems,
    ];
    const match = allItems.find((item) => hrefFor(item.path) === activeHref);
    if (match) return match.label;
    const favoriteMatch = favorites.find((favorite) => favorite.route === activeHref);
    return favoriteMatch?.name;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hrefFor/basePath change together
  }, [
    activeHref,
    visibleGroup1Items,
    visibleClassItems,
    visibleClassTypeItems,
    visibleAllClassesItems,
    favorites,
    basePath,
  ]);

  function openCreateOption(next: () => void) {
    setIsCreateMenuOpen(false);
    next();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: "8px 8px 10px",
        boxSizing: "border-box",
      }}
    >
      <SidebarHeader>
        <WorkspaceMenu name={displayName} icon={<AccountAvatar initials={initials} />}>
          <DropdownItem
            label="Settings"
            icon={<Settings size={16} strokeWidth={1.75} />}
            onSelect={onSettingsClick ?? (() => router.push(hrefFor("/settings")))}
          />
          <DropdownItem
            label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            icon={
              mode === "dark" ? (
                <Sun size={16} strokeWidth={1.75} />
              ) : (
                <Moon size={16} strokeWidth={1.75} />
              )
            }
            onSelect={toggle}
          />
          {isMigrate ? (
            <DropdownItem
              label={demoEnabled ? "Exit demo mode" : "Enter demo mode"}
              icon={<FlaskConical size={16} strokeWidth={1.75} />}
              onSelect={() => requestDemoTransition(demoEnabled ? "live" : "demo")}
            />
          ) : null}
        </WorkspaceMenu>
        <SidebarHeaderActions>
          <SidebarIconButton
            label="Search"
            variant="ghost"
            icon={<Search size={16} strokeWidth={1.75} />}
          />
          <Dropdown
            label="Create"
            placement="below"
            alignment="end"
            open={isCreateMenuOpen}
            onOpenChange={setIsCreateMenuOpen}
            trigger={
              <SidebarIconButton
                label="Create new issue"
                variant="primary"
                icon={<Plus size={16} strokeWidth={1.75} />}
              />
            }
          >
            <DropdownItem
              label="New Story"
              icon={<FileText size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setIsNewStoryOpen(true))}
            />
            <DropdownItem
              label="New Event"
              icon={<CalendarDays size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setIsNewEventOpen(true))}
            />
            <DropdownItem
              label="New Email"
              icon={<Mail size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setPromotionModalType("email"))}
            />
            <DropdownItem
              label="New Social Post"
              icon={<Megaphone size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setPromotionModalType("social"))}
            />
          </Dropdown>
        </SidebarHeaderActions>
      </SidebarHeader>

      <SidebarScrollArea>
        <SidebarSection>
          {visibleGroup1Items.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Open classes">
          {visibleClassItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
            />
          ))}
          {visibleClassTypeItems.length > 0 || visibleAllClassesItems.length > 0 ? (
            <Dropdown
              label="More"
              trigger={
                <MenuItem
                  label="More"
                  icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                  selected={[...visibleClassTypeItems, ...visibleAllClassesItems].some((item) =>
                    isSelected(item.path)
                  )}
                />
              }
            >
              {visibleClassTypeItems.map((item) => (
                <DropdownItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  selected={isSelected(item.path)}
                  onSelect={() => router.push(hrefFor(item.path))}
                />
              ))}
              {visibleAllClassesItems.length > 0 ? <DropdownSeparator /> : null}
              {visibleAllClassesItems.map((item) => (
                <DropdownItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  selected={isSelected(item.path)}
                  onSelect={() => router.push(hrefFor(item.path))}
                />
              ))}
            </Dropdown>
          ) : null}
        </SidebarSection>

        {favorites.length > 0 ? (
          <SidebarSection title="Favorites">
            {favorites.map((favorite) => (
              <MenuItem
                key={favorite.id}
                label={favorite.name}
                icon={<Star size={16} strokeWidth={1.75} />}
                selected={favorite.route === activeHref}
                onClick={() => router.push(favorite.route)}
                action={
                  onRemoveFavorite ? (
                    <SidebarIconButton
                      label={`Remove ${favorite.name} from favorites`}
                      variant="ghost"
                      icon={<Trash2 size={14} strokeWidth={1.75} />}
                      onClick={() => onRemoveFavorite(favorite.route)}
                    />
                  ) : undefined
                }
              />
            ))}
          </SidebarSection>
        ) : null}
      </SidebarScrollArea>

      {isMigrate && demoEnabled ? (
        <DemoModeCard onExitClick={() => requestDemoTransition("live")} />
      ) : null}

      <NavBottom
        start={isMigrate ? null : <TryButton />}
        end={
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SidebarIconButton
              label="Report bug or request feature"
              variant="ghost"
              icon={<Bug size={16} strokeWidth={1.75} />}
              onClick={() => setIsReportIssueOpen(true)}
            />
            <SidebarIconButton
              label="Help"
              variant="ghost"
              icon={<HelpCircle size={16} strokeWidth={1.75} />}
            />
          </div>
        }
      />

      {isMigrate ? (
        <MigrateCreateModals
          isNewStoryOpen={isNewStoryOpen}
          onCloseNewStory={() => setIsNewStoryOpen(false)}
          isNewEventOpen={isNewEventOpen}
          onCloseNewEvent={() => setIsNewEventOpen(false)}
          hrefFor={hrefFor}
        />
      ) : (
        <>
          <NewStoryModal isOpen={isNewStoryOpen} onClose={() => setIsNewStoryOpen(false)} />
          <NewEventModal isOpen={isNewEventOpen} onClose={() => setIsNewEventOpen(false)} />
        </>
      )}
      <AddPromotionModal
        type={promotionModalType}
        onClose={() => setPromotionModalType(null)}
        onAdd={() => {}}
      />
      {isMigrate ? (
        <DemoModeConfirmModal
          isOpen={demoTransition !== null}
          target={demoTransition ?? "demo"}
          onCancel={() => setDemoTransition(null)}
          onConfirm={confirmDemoTransition}
        />
      ) : null}
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        sectionLabel={activeSectionLabel}
      />
    </div>
  );
}
