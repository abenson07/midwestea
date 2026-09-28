import type { PaletteActionHandlers } from "./paletteActions";
import type { PaletteResult } from "./types";

export type RecentPaletteEntry = {
  id: string;
  kind: PaletteResult["kind"];
  title: string;
  subtitle?: string;
  href?: string;
  actionId?: string;
};

const STORAGE_KEY = "admin-command-palette-recents";
export const MAX_RECENTS = 3;

export function loadRecents(): RecentPaletteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is RecentPaletteEntry => {
        return Boolean(row && typeof row === "object" && typeof (row as RecentPaletteEntry).id === "string" && typeof (row as RecentPaletteEntry).title === "string");
      })
      .slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export function toRecentEntry(result: PaletteResult): RecentPaletteEntry | null {
  if (!result.href && !result.actionId) return null;
  const id = result.id.startsWith("recent:") ? result.id.slice("recent:".length) : result.id;
  return {
    id,
    kind: result.kind,
    title: result.title,
    subtitle: result.subtitle,
    href: result.href,
    actionId: result.actionId,
  };
}

export function pushRecent(entry: RecentPaletteEntry): RecentPaletteEntry[] {
  const next = [entry, ...loadRecents().filter((row) => row.id !== entry.id)].slice(0, MAX_RECENTS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — recents are best-effort.
  }
  return next;
}

export function recentsToResults(
  recents: RecentPaletteEntry[],
  push: (href: string) => void,
  handlers: PaletteActionHandlers,
): PaletteResult[] {
  return recents.map((entry) => ({
    id: `recent:${entry.id}`,
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    icon: "recent",
    score: 0,
    href: entry.href,
    actionId: entry.actionId,
    onSelect: () => {
      if (entry.href) {
        push(entry.href);
        return;
      }
      if (entry.actionId === "new-class") handlers.onNewClass();
      else if (entry.actionId === "new-transaction") handlers.onNewTransaction();
      else if (entry.actionId === "add-location") handlers.onAddLocation();
      else if (entry.actionId === "add-student") handlers.onAddStudent();
    },
  }));
}
