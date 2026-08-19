import type { AdminBasePath } from "@/components/admin-migrate/patterns/client-templates/shared";
import type { PaletteIconKey, PaletteResult } from "./types";

export type PageEntry = {
  id: string;
  label: string;
  path: string;
  icon: PaletteIconKey;
};

/** Every routed top-level admin page — verified against `apps/webapp/app/(platform)/admin/`. */
export const PALETTE_PAGES: PageEntry[] = [
  { id: "overview", label: "Overview", path: "/overview", icon: "overview" },
  { id: "classes", label: "All Classes", path: "/classes", icon: "classes" },
  { id: "classes-open", label: "Open Classes", path: "/classes/open", icon: "classes" },
  { id: "classes-closed", label: "Closed Classes", path: "/classes/closed", icon: "classes" },
  { id: "courses", label: "Courses", path: "/courses", icon: "courses" },
  { id: "programs", label: "Programs", path: "/programs", icon: "programs" },
  { id: "students", label: "Students", path: "/students", icon: "students" },
  { id: "students-current", label: "Current Students", path: "/students/current", icon: "students" },
  { id: "students-past-due", label: "Past Due Students", path: "/students/past-due", icon: "students" },
  { id: "transactions", label: "Transactions", path: "/transactions", icon: "transactions" },
  { id: "locations", label: "Locations", path: "/locations", icon: "locations" },
  { id: "prerequisites", label: "Prerequisites", path: "/prerequisites", icon: "prerequisites" },
  { id: "settings", label: "Settings", path: "/settings", icon: "settings" },
];

/** Shown (unfiltered) when the palette opens with an empty query. */
export const DEFAULT_PAGE_IDS = ["overview", "classes", "students", "transactions", "locations"];

export function buildPageResult(
  page: PageEntry,
  basePath: AdminBasePath,
  push: (href: string) => void,
  score = 0,
): PaletteResult {
  const href = `${basePath}${page.path}`;
  return {
    id: `page:${page.id}`,
    kind: "page",
    title: page.label,
    icon: page.icon,
    score,
    href,
    onSelect: () => push(href),
  };
}

export type PaletteActionHandlers = {
  onNewClass: () => void;
  onNewTransaction: () => void;
  onAddLocation: () => void;
  onAddStudent: () => void;
};

type ActionEntry = {
  id: string;
  title: string;
  subtitle?: string;
  icon: PaletteIconKey;
  run: (handlers: PaletteActionHandlers) => void;
};

const ACTION_ENTRIES: ActionEntry[] = [
  {
    id: "new-class",
    title: "New Class",
    subtitle: "Create a class",
    icon: "new-class",
    run: (h) => h.onNewClass(),
  },
  {
    id: "new-transaction",
    title: "New Invoice",
    subtitle: "Create an invoice",
    icon: "new-transaction",
    run: (h) => h.onNewTransaction(),
  },
  {
    id: "add-location",
    title: "Add Location",
    icon: "add-location",
    run: (h) => h.onAddLocation(),
  },
  {
    id: "add-student",
    title: "Add Student",
    subtitle: "Choose a class",
    icon: "add-student",
    run: (h) => h.onAddStudent(),
  },
];

export function buildActionResults(handlers: PaletteActionHandlers, score = 0): PaletteResult[] {
  return ACTION_ENTRIES.map((entry) => ({
    id: `action:${entry.id}`,
    kind: "action",
    title: entry.title,
    subtitle: entry.subtitle,
    icon: entry.icon,
    score,
    actionId: entry.id,
    onSelect: () => entry.run(handlers),
  }));
}
