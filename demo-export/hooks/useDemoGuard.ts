"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import {
  applyDemoPatch,
  DEMO_STORE_EVENT,
  mergeDemoCollection,
  patchDemoEntity,
  readDemoStore,
  upsertDemoEntity,
  type DemoCollectionKind,
  type DemoStore,
} from "@/lib/demo/demoStore";
import type { DemoOverlay, DemoOverlayKind } from "@/lib/demo/demoOverlay";

export type DemoGuardOptions = {
  /** Human label used in the default toast, e.g. "Person updated". */
  action: string;
  successMessage?: string;
  /**
   * Demo-only side effect (localStorage / UI state). Runs instead of `realFn`
   * when demo mode is on. Prefer this over a no-op so walkthroughs persist.
   */
  local?: () => void | Promise<void>;
};

export type SendDemoEmailPayload = {
  subject: string;
  text: string;
  html?: string;
  /** e.g. the real recipient this would have gone to in production — shown for context. */
  context?: string;
};

function storeToOverlay(store: DemoStore): DemoOverlay {
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

/**
 * Central demo-mode write guard for admin-migrate. In demo mode, `guard()`
 * runs an optional `local` persist callback and toasts "saved locally only"
 * instead of writing to Supabase; `sendDemoEmail()` still sends a real email
 * to the current admin's own inbox; `overlay` / `store` helpers persist
 * entities to localStorage for the walkthrough.
 */
export function useDemoGuard() {
  const { enabled } = useDemoModeOptional();
  const [storeVersion, setStoreVersion] = useState(0);
  const [overlayState, setOverlayState] = useState<DemoOverlay>(() =>
    storeToOverlay(readDemoStore()),
  );

  useEffect(() => {
    function onStoreChange() {
      setOverlayState(storeToOverlay(readDemoStore()));
      setStoreVersion((v) => v + 1);
    }
    window.addEventListener(DEMO_STORE_EVENT, onStoreChange);
    return () => window.removeEventListener(DEMO_STORE_EVENT, onStoreChange);
  }, []);

  const guard = useCallback(
    async function guard<T>(realFn: () => Promise<T>, opts: DemoGuardOptions): Promise<T | undefined> {
      if (!enabled) return realFn();
      if (opts.local) await opts.local();
      toast.success(opts.successMessage ?? `${opts.action} — demo mode, saved locally only`);
      return undefined;
    },
    [enabled],
  );

  const sendDemoEmail = useCallback(async (payload: SendDemoEmailPayload) => {
    const res = await fetch("/api/demo/send-self-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { sent?: boolean; error?: string };
    if (!res.ok || !data.sent) throw new Error(data.error ?? "Failed to send demo email");
    toast.success("Email sent to your inbox (demo mode redirect)");
    return data;
  }, []);

  const patch = useCallback((kind: DemoOverlayKind, id: string, value: Record<string, unknown>) => {
    setOverlayState(storeToOverlay(patchDemoEntity(kind, id, value)));
  }, []);

  const upsert = useCallback(
    (kind: DemoCollectionKind, entity: Record<string, unknown> & { id: string }) => {
      setOverlayState(storeToOverlay(upsertDemoEntity(kind, entity)));
    },
    [],
  );

  const apply = useCallback(
    <T extends { id: string }>(kind: DemoOverlayKind, base: T): T =>
      applyDemoPatch(kind, base, readDemoStore()),
    // storeVersion forces re-apply when localStorage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overlayState, storeVersion],
  );

  const merge = useCallback(
    <T extends { id: string }>(kind: DemoCollectionKind, base: T[]): T[] =>
      mergeDemoCollection(kind, base),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  return {
    enabled,
    guard,
    sendDemoEmail,
    overlay: { patch, apply, upsert },
    store: { upsert, patch: patchDemoEntity, merge, version: storeVersion },
  };
}
