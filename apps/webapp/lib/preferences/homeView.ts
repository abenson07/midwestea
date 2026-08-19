export const HOME_VIEW_STORAGE_KEY = "admin-preview-home-view";

export const HOME_VIEW_OPTIONS = [
  { id: "overview", label: "Overview", path: "/overview" },
  { id: "inbox", label: "Inbox", path: "/inbox" },
  { id: "students", label: "Students", path: "/students" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "programs", label: "Programs", path: "/programs" },
  { id: "courses", label: "Courses", path: "/courses" },
  { id: "classes", label: "All Classes", path: "/classes" },
] as const;

export type HomeViewId = (typeof HOME_VIEW_OPTIONS)[number]["id"];

const HOME_VIEW_IDS = new Set<string>(HOME_VIEW_OPTIONS.map((option) => option.id));

export function isHomeViewId(value: string): value is HomeViewId {
  return HOME_VIEW_IDS.has(value);
}

export function readHomeView(): HomeViewId {
  if (typeof window === "undefined") return "overview";
  const stored = window.localStorage.getItem(HOME_VIEW_STORAGE_KEY);
  return stored && isHomeViewId(stored) ? stored : "overview";
}

export function writeHomeView(id: HomeViewId) {
  window.localStorage.setItem(HOME_VIEW_STORAGE_KEY, id);
}

export function homeViewPath(id: HomeViewId): string {
  return HOME_VIEW_OPTIONS.find((option) => option.id === id)?.path ?? "/overview";
}
