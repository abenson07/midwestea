import type { SampleVolunteerAsk } from "@/data/mocks/committees";
import { getSampleVolunteerAsks } from "@/data/mocks/committees";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { DEMO_STORE_EVENT } from "./demoStore";

const STORAGE_KEY = "admin-migrate-demo-volunteer-asks:v1";
export const DEMO_VOLUNTEER_ASKS_EVENT = "admin-migrate-demo-volunteer-asks";

function readAll(): SampleVolunteerAsk[] {
  if (typeof window === "undefined") return [];
  try {
    // Prefer localStorage; migrate any leftover sessionStorage.
    const local = window.localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as SampleVolunteerAsk[];
      return Array.isArray(parsed) ? parsed : [];
    }
    const session = window.sessionStorage.getItem(STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session) as SampleVolunteerAsk[];
      if (Array.isArray(parsed)) {
        window.localStorage.setItem(STORAGE_KEY, session);
        window.sessionStorage.removeItem(STORAGE_KEY);
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function writeAll(rows: SampleVolunteerAsk[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(DEMO_VOLUNTEER_ASKS_EVENT));
  window.dispatchEvent(new Event(DEMO_STORE_EVENT));
}

/** Sample seed + any locally created/edited asks for this committee. */
export function listDemoVolunteerAsks(committee: CommitteeSlug): SampleVolunteerAsk[] {
  const stored = readAll().filter((a) => a.committee === committee);
  if (stored.length > 0) return stored;
  return getSampleVolunteerAsks(committee);
}

export function upsertDemoVolunteerAsk(ask: SampleVolunteerAsk): void {
  const others = readAll().filter((a) => a.id !== ask.id);
  const sameCommittee = others.filter((a) => a.committee === ask.committee);
  const otherCommittees = others.filter((a) => a.committee !== ask.committee);
  if (sameCommittee.length === 0) {
    const seeded = getSampleVolunteerAsks(ask.committee).filter((a) => a.id !== ask.id);
    writeAll([...otherCommittees, ask, ...seeded]);
    return;
  }
  writeAll([ask, ...others]);
}

export function removeDemoVolunteerAsk(id: string, committee: CommitteeSlug): void {
  const existing = readAll();
  if (existing.length === 0) {
    writeAll(getSampleVolunteerAsks(committee).filter((a) => a.id !== id));
    return;
  }
  writeAll(existing.filter((a) => a.id !== id));
}

export function replaceDemoVolunteerAsks(
  committee: CommitteeSlug,
  asks: SampleVolunteerAsk[],
): void {
  const others = readAll().filter((a) => a.committee !== committee);
  writeAll([...asks, ...others]);
}

export function clearDemoVolunteerAsks(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(DEMO_VOLUNTEER_ASKS_EVENT));
}
