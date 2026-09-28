/**
 * LocalStorage-backed demo-mode persistence for /admin-migrate.
 * Never touches Supabase/Stripe/Webflow — walkthrough mutations live here until exit.
 */

export const DEMO_STORE_EVENT = "admin-migrate-demo-store";
export const DEMO_STORE_KEY = "admin-migrate-demo-store:v1";

/** Legacy keys cleared on exit / migration. */
const LEGACY_KEYS = {
  overlay: "admin-migrate-demo-overlay:v1",
  volunteerAsksSession: "admin-migrate-demo-volunteer-asks:v1",
  initiativesSession: "admin-migrate-demo-initiatives:v1",
  volunteerAsksLocal: "admin-migrate-demo-volunteer-asks:v1",
  initiativesLocal: "admin-migrate-demo-initiatives:v1",
} as const;

export type DemoCollectionKind =
  | "people"
  | "businesses"
  | "events"
  | "stories"
  | "faqs"
  | "banners"
  | "eventTasks"
  | "eventVolunteers"
  | "eventAsks"
  | "sponsorships"
  | "committeeMembers"
  | "committeeMeetings"
  | "leafletRoutes"
  | "leafletDeliverers"
  | "leafletTasks"
  | "invoices"
  | "accountSettings"
  | "qrCodes"
  | "inbox";

export type DemoBucket = {
  /** Full entity records keyed by id (creates + full replacements). */
  entities: Record<string, Record<string, unknown>>;
  /** Partial field patches merged onto seed/base rows. */
  patches: Record<string, Record<string, unknown>>;
  deleted: string[];
};

export type DemoStore = {
  buckets: Record<DemoCollectionKind, DemoBucket>;
};

const COLLECTION_KINDS: DemoCollectionKind[] = [
  "people",
  "businesses",
  "events",
  "stories",
  "faqs",
  "banners",
  "eventTasks",
  "eventVolunteers",
  "eventAsks",
  "sponsorships",
  "committeeMembers",
  "committeeMeetings",
  "leafletRoutes",
  "leafletDeliverers",
  "leafletTasks",
  "invoices",
  "accountSettings",
  "qrCodes",
  "inbox",
];

function emptyBucket(): DemoBucket {
  return { entities: {}, patches: {}, deleted: [] };
}

function emptyStore(): DemoStore {
  const buckets = {} as Record<DemoCollectionKind, DemoBucket>;
  for (const kind of COLLECTION_KINDS) buckets[kind] = emptyBucket();
  return { buckets };
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_STORE_EVENT));
}

function migrateLegacyOverlay(store: DemoStore): DemoStore {
  if (typeof window === "undefined") return store;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEYS.overlay);
    if (!raw) return store;
    const parsed = JSON.parse(raw) as {
      people?: Record<string, Record<string, unknown>>;
      businesses?: Record<string, Record<string, unknown>>;
    };
    if (parsed.people) {
      store.buckets.people.patches = { ...parsed.people, ...store.buckets.people.patches };
    }
    if (parsed.businesses) {
      store.buckets.businesses.patches = {
        ...parsed.businesses,
        ...store.buckets.businesses.patches,
      };
    }
    window.localStorage.removeItem(LEGACY_KEYS.overlay);
  } catch {
    /* ignore */
  }
  return store;
}

export function readDemoStore(): DemoStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(DEMO_STORE_KEY);
    let store = emptyStore();
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoStore>;
      for (const kind of COLLECTION_KINDS) {
        const b = parsed.buckets?.[kind];
        store.buckets[kind] = {
          entities: b?.entities ?? {},
          patches: b?.patches ?? {},
          deleted: Array.isArray(b?.deleted) ? b.deleted : [],
        };
      }
    }
    store = migrateLegacyOverlay(store);
    return store;
  } catch {
    return emptyStore();
  }
}

function writeDemoStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  notify();
}

export function clearDemoStore(): DemoStore {
  const store = emptyStore();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
    window.localStorage.removeItem(LEGACY_KEYS.overlay);
    // Lazy-import avoid circular deps — clear companion keys directly.
    window.localStorage.removeItem(LEGACY_KEYS.volunteerAsksLocal);
    window.localStorage.removeItem(LEGACY_KEYS.initiativesLocal);
    window.sessionStorage.removeItem(LEGACY_KEYS.volunteerAsksSession);
    window.sessionStorage.removeItem(LEGACY_KEYS.initiativesSession);
    notify();
    window.dispatchEvent(new Event("admin-migrate-demo-volunteer-asks"));
  }
  return store;
}

export function newDemoId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function patchDemoEntity(
  kind: DemoCollectionKind,
  id: string,
  patch: Record<string, unknown>,
): DemoStore {
  const store = readDemoStore();
  const bucket = store.buckets[kind];
  if (bucket.entities[id]) {
    bucket.entities[id] = { ...bucket.entities[id], ...patch };
  } else {
    bucket.patches[id] = { ...bucket.patches[id], ...patch };
  }
  writeDemoStore(store);
  return store;
}

export function upsertDemoEntity(
  kind: DemoCollectionKind,
  entity: Record<string, unknown> & { id: string },
): DemoStore {
  const store = readDemoStore();
  const bucket = store.buckets[kind];
  bucket.entities[entity.id] = { ...bucket.entities[entity.id], ...entity };
  bucket.deleted = bucket.deleted.filter((d) => d !== entity.id);
  delete bucket.patches[entity.id];
  writeDemoStore(store);
  return store;
}

export function removeDemoEntity(kind: DemoCollectionKind, id: string): DemoStore {
  const store = readDemoStore();
  const bucket = store.buckets[kind];
  delete bucket.entities[id];
  delete bucket.patches[id];
  if (!bucket.deleted.includes(id)) bucket.deleted.push(id);
  writeDemoStore(store);
  return store;
}

export function listDemoEntities<T extends { id: string }>(kind: DemoCollectionKind): T[] {
  const store = readDemoStore();
  return Object.values(store.buckets[kind].entities) as T[];
}

export function getDemoEntity<T extends { id: string }>(
  kind: DemoCollectionKind,
  id: string,
): T | null {
  const store = readDemoStore();
  const entity = store.buckets[kind].entities[id];
  return entity ? (entity as T) : null;
}

/** Merge patches/entities/deletes over a base list of seed or live rows. */
export function mergeDemoCollection<T extends { id: string }>(
  kind: DemoCollectionKind,
  base: T[],
): T[] {
  const store = readDemoStore();
  const bucket = store.buckets[kind];
  const deleted = new Set(bucket.deleted);
  const byId = new Map<string, T>();

  for (const row of base) {
    if (deleted.has(row.id)) continue;
    const patch = bucket.patches[row.id];
    const entity = bucket.entities[row.id];
    if (entity) {
      byId.set(row.id, { ...row, ...entity } as T);
    } else if (patch) {
      byId.set(row.id, { ...row, ...patch } as T);
    } else {
      byId.set(row.id, row);
    }
  }

  for (const [id, entity] of Object.entries(bucket.entities)) {
    if (deleted.has(id) || byId.has(id)) continue;
    byId.set(id, entity as T);
  }

  return Array.from(byId.values());
}

/** Apply store patches for a single base row (compat with old overlay.apply). */
export function applyDemoPatch<T extends { id: string }>(
  kind: DemoCollectionKind,
  base: T,
  store?: DemoStore,
): T {
  const s = store ?? readDemoStore();
  const bucket = s.buckets[kind];
  if (bucket.deleted.includes(base.id)) return base;
  const entity = bucket.entities[base.id];
  const patch = bucket.patches[base.id];
  if (entity) return { ...base, ...entity } as T;
  if (patch) return { ...base, ...patch } as T;
  return base;
}

/** Scoped list keyed under a parent id (e.g. event tasks under eventId). */
export function listDemoScoped<T extends { id: string }>(
  kind: DemoCollectionKind,
  scopeKey: string,
): T[] | null {
  const store = readDemoStore();
  const scoped = store.buckets[kind].entities[scopeKey];
  if (!scoped || !Array.isArray(scoped.items)) return null;
  return scoped.items as T[];
}

export function writeDemoScoped<T extends { id: string }>(
  kind: DemoCollectionKind,
  scopeKey: string,
  items: T[],
): DemoStore {
  const store = readDemoStore();
  store.buckets[kind].entities[scopeKey] = {
    id: scopeKey,
    items: items as unknown as Record<string, unknown>[],
  };
  store.buckets[kind].deleted = store.buckets[kind].deleted.filter((d) => d !== scopeKey);
  writeDemoStore(store);
  return store;
}
