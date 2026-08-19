"use client";

import { Suspense, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  BookOpen,
  Bug,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  FlaskConical,
  Moon,
  MoreHorizontal,
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
} from "@/components/admin-migrate/patterns/shared/dropdown";
import { clearDemoStore } from "@/lib/demo/demoStore";
import { useCurrentAdmin } from "@/lib/admin-migrate/useCurrentAdmin";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { getBestMatchingHref } from "@/lib/nav/getBestMatchingHref";
import { useAdminBasePath } from "@/components/admin-migrate/patterns/client-templates/shared";
import { useStagingOpenClasses } from "@/lib/admin-migrate/useOpenClasses";
import { splitOpenClassNav, type StagingOpenClass } from "@/lib/admin-migrate/openClasses";
import { ClassNavHoverCard } from "./sidebar/ClassNavHoverCard";
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
import { DEMO_MODE_AVAILABLE, useDemoModeOptional } from "./DemoModeContext";
import { useWipFeaturesOptional } from "./WipFeaturesContext";
import { DemoModeConfirmModal, type DemoModeConfirmModalTarget } from "./DemoModeConfirmModal";
import { ReportIssueModal } from "./ReportIssueModal";
import { useCommandPaletteOptional } from "./command-palette";
import "./sidebar/sidebar.css";

type DemoItem = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Path relative to the active base (`/admin-preview` or `/admin`) — prefixed at render time. */
  path: string;
  /** Hidden on /admin unless the "Preview features in development" setting is on. */
  wip?: boolean;
  count?: number;
  openClass?: StagingOpenClass;
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
];

const classCatalogItems: DemoItem[] = [
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
  {
    id: "all-classes",
    label: "All Classes",
    icon: <LayoutGrid size={16} strokeWidth={1.75} />,
    path: "/classes",
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

function OpenClassNavSection({
  title,
  items,
  isSelected,
  onNavigate,
}: {
  title: string;
  items: DemoItem[];
  isSelected: (path: string) => boolean;
  onNavigate: (path: string) => void;
}) {
  const { visible, overflow } = splitOpenClassNav(items);

  return (
    <SidebarSection title={title}>
      {visible.map((item) => {
        const row = (
          <MenuItem
            label={item.label}
            icon={item.icon}
            count={item.count}
            countOnHover
            selected={isSelected(item.path)}
            onClick={() => onNavigate(item.path)}
          />
        );
        return item.openClass ? (
          <ClassNavHoverCard key={item.id} item={item.openClass}>
            {row}
          </ClassNavHoverCard>
        ) : (
          <div key={item.id}>{row}</div>
        );
      })}
      {overflow.length > 0 ? (
        <Dropdown
          label="More"
          trigger={
            <MenuItem
              label="More"
              icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
              selected={overflow.some((item) => isSelected(item.path))}
            />
          }
        >
          {overflow.map((item) => (
            <DropdownItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.path)}
              onSelect={() => onNavigate(item.path)}
            />
          ))}
        </Dropdown>
      ) : null}
    </SidebarSection>
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
 * Favorites are stubbed to an empty list for now — useFavorites() came from
 * the removed demo "hooks" package (react-query-backed, Supabase-stored).
 * Left wired as real props/UI rather than deleted, so a real
 * Supabase-backed favorites hook can be dropped in later without touching
 * this component's structure.
 */
export function LinearSidebar(props: LinearSidebarProps = {}) {
  return (
    <Suspense fallback={null}>
      <LinearSidebarBase {...props} favorites={[]} onRemoveFavorite={undefined} />
    </Suspense>
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
  const commandPalette = useCommandPaletteOptional();
  const [demoTransition, setDemoTransition] = useState<DemoModeConfirmModalTarget | null>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const isMigrate = basePath === "/admin";
  const { admin: currentAdmin } = useCurrentAdmin();
  const displayName = currentAdmin?.display_name || "Kyle Brower";
  const initials = initialsFromName(displayName);
  // admin-preview is a frozen pattern library, not shipped as-is — only /admin
  // needs its WIP items (committees/inbox/overview) hidden until opted in.
  const showWipItems = !isMigrate || wipFeaturesEnabled;
  // Real everywhere except the frozen /admin-preview demo — not just
  // /new-admin-migrate, so this stays correct once at the real /admin home too.
  const hideInbox = basePath !== "/admin-preview";
  const hideFixtureNav = basePath !== "/admin-preview";
  const stagingOpenClasses = useStagingOpenClasses(hideFixtureNav);
  const visibleGroup1Items = (showWipItems
    ? group1Items
    : group1Items.filter((item) => !item.wip)
  )
    .filter((item) => !hideInbox || item.id !== "inbox");
  const stagingProgramItems = stagingOpenClasses.programs.map((row) => ({
    id: row.id,
    label: row.label,
    icon: <GraduationCap size={16} strokeWidth={1.75} />,
    path: row.path,
    count: row.enrolledCount,
    openClass: row,
  }));
  const stagingCourseItems = stagingOpenClasses.courses.map((row) => ({
    id: row.id,
    label: row.label,
    icon: <BookOpen size={16} strokeWidth={1.75} />,
    path: row.path,
    count: row.enrolledCount,
    openClass: row,
  }));
  const visibleClassItems = hideFixtureNav
    ? [...stagingProgramItems, ...stagingCourseItems]
    : showWipItems
      ? classItems
      : classItems.filter((item) => !item.wip);
  const visibleClassTypeItems = hideFixtureNav
    ? []
    : showWipItems
      ? classTypeItems
      : classTypeItems.filter((item) => !item.wip);
  const visibleClassCatalogItems = showWipItems
    ? classCatalogItems
    : classCatalogItems.filter((item) => !item.wip);

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
      ...visibleClassCatalogItems.map((item) => hrefFor(item.path)),
      ...favorites.map((favorite) => favorite.route),
    ];
    return getBestMatchingHref(currentRoute, allHrefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hrefFor/basePath change together; visible* items are stable module-level data
  }, [
    currentRoute,
    visibleGroup1Items,
    visibleClassItems,
    visibleClassTypeItems,
    visibleClassCatalogItems,
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
      ...visibleClassCatalogItems,
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
    visibleClassCatalogItems,
    favorites,
    basePath,
  ]);

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
          {isMigrate && DEMO_MODE_AVAILABLE ? (
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
            onClick={commandPalette?.open}
          />
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

        {visibleClassCatalogItems.length > 0 ? (
          <SidebarSection title="Classes">
            {visibleClassCatalogItems.map((item) => (
              <MenuItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                selected={isSelected(item.path)}
                onClick={() => router.push(hrefFor(item.path))}
              />
            ))}
          </SidebarSection>
        ) : null}

        {hideFixtureNav ? (
          <>
            <OpenClassNavSection
              title="Open programs"
              items={stagingProgramItems}
              isSelected={isSelected}
              onNavigate={(path) => router.push(hrefFor(path))}
            />
            <OpenClassNavSection
              title="Open courses"
              items={stagingCourseItems}
              isSelected={isSelected}
              onNavigate={(path) => router.push(hrefFor(path))}
            />
          </>
        ) : (
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
            {visibleClassTypeItems.length > 0 ? (
              <Dropdown
                label="More"
                trigger={
                  <MenuItem
                    label="More"
                    icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                    selected={visibleClassTypeItems.some((item) => isSelected(item.path))}
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
              </Dropdown>
            ) : null}
          </SidebarSection>
        )}

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

      {isMigrate && DEMO_MODE_AVAILABLE && demoEnabled ? (
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

      {isMigrate && DEMO_MODE_AVAILABLE ? (
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
