import type { CommitteeInitiative } from "@/data/mocks/committees";
import { DEMO_STORE_EVENT } from "./demoStore";

const STORAGE_KEY = "admin-migrate-demo-initiatives:v1";

function readAll(): CommitteeInitiative[] {
  if (typeof window === "undefined") return [];
  try {
    const local = window.localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as CommitteeInitiative[];
      return Array.isArray(parsed) ? parsed : [];
    }
    const session = window.sessionStorage.getItem(STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session) as CommitteeInitiative[];
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

function writeAll(rows: CommitteeInitiative[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(DEMO_STORE_EVENT));
}

export function listDemoInitiatives(): CommitteeInitiative[] {
  return readAll();
}

export function getDemoInitiative(id: string): CommitteeInitiative | null {
  return readAll().find((i) => i.id === id) ?? null;
}

export function upsertDemoInitiative(initiative: CommitteeInitiative): void {
  const rows = readAll().filter((i) => i.id !== initiative.id);
  rows.unshift(initiative);
  writeAll(rows);
}

export function clearDemoInitiatives(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}
