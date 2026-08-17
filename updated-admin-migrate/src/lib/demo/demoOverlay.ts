/**
 * Backward-compatible people/business overlay API over demoStore.
 * Prefer `@/lib/demo/demoStore` for new code.
 */

import {
  applyDemoPatch,
  clearDemoStore,
  patchDemoEntity,
  readDemoStore,
  type DemoStore,
} from "./demoStore";

export type DemoOverlayKind = "people" | "businesses";

export type DemoOverlay = {
  people: Record<string, Record<string, unknown>>;
  businesses: Record<string, Record<string, unknown>>;
};

function toOverlay(store: DemoStore): DemoOverlay {
  return {
    people: {
      ...store.buckets.people.patches,
      ...store.buckets.people.entities,
    },
    businesses: {
      ...store.buckets.businesses.patches,
      ...store.buckets.businesses.entities,
    },
  };
}

export function readOverlay(): DemoOverlay {
  return toOverlay(readDemoStore());
}

/** Merge `patch` into the stored record for `kind`/`id` and persist. */
export function patchOverlayEntity(
  kind: DemoOverlayKind,
  id: string,
  patch: Record<string, unknown>,
): DemoOverlay {
  return toOverlay(patchDemoEntity(kind, id, patch));
}

export function clearOverlay(): DemoOverlay {
  return toOverlay(clearDemoStore());
}

/** Merge any stored overlay patch for `kind`/`id` over `base`. */
export function applyOverlay<T extends { id: string }>(
  overlay: DemoOverlay,
  kind: DemoOverlayKind,
  base: T,
): T {
  const patch = overlay[kind][base.id];
  return patch ? { ...base, ...patch } : base;
}

/** Apply live store patches (preferred when overlay snapshot may be stale). */
export function applyOverlayLive<T extends { id: string }>(kind: DemoOverlayKind, base: T): T {
  return applyDemoPatch(kind, base);
}
