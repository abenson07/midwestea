"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DemoModeContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

const STORAGE_KEY = "admin-migrate-demo-mode";

/** Flip to true to restore the sidebar toggle, confirm modal, and `?demo=` URL override. */
export const DEMO_MODE_AVAILABLE = false;

function readStoredEnabled(defaultEnabled: boolean): boolean {
  if (typeof window === "undefined") return defaultEnabled;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "on") return true;
  if (stored === "off") return false;
  return defaultEnabled;
}

function writeStoredEnabled(enabled: boolean) {
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}

export type DemoModeProviderProps = {
  children: ReactNode;
  /** Default when nothing is stored. Live admin defaults to off. */
  defaultEnabled?: boolean;
};

/**
 * Persisted demo-mode switch for `/admin-migrate`.
 * When enabled, Mixed/Dummy surfaces may show `sample*` mocks.
 * When disabled, those surfaces use DB data or empty states.
 */
export function DemoModeProvider({
  children,
  defaultEnabled = false,
}: DemoModeProviderProps) {
  const [enabled, setEnabledState] = useState(defaultEnabled);
  const [hydrated, setHydrated] = useState(false);

  const setEnabled = useCallback((next: boolean) => {
    if (!DEMO_MODE_AVAILABLE) return;
    setEnabledState(next);
    writeStoredEnabled(next);
  }, []);

  const toggle = useCallback(() => {
    if (!DEMO_MODE_AVAILABLE) return;
    setEnabledState((current) => {
      const next = !current;
      writeStoredEnabled(next);
      return next;
    });
  }, []);

  // Hydrate from localStorage, then honor one-shot ?demo=1|0 and strip the param.
  useEffect(() => {
    const url = new URL(window.location.href);
    const param = url.searchParams.get("demo");

    if (!DEMO_MODE_AVAILABLE) {
      writeStoredEnabled(false);
      setEnabledState(false);
      setHydrated(true);
    } else {
      let next = readStoredEnabled(defaultEnabled);
      if (param === "1" || param === "true" || param === "on") {
        next = true;
        writeStoredEnabled(true);
      } else if (param === "0" || param === "false" || param === "off") {
        next = false;
        writeStoredEnabled(false);
      }
      setEnabledState(next);
      setHydrated(true);
    }

    if (param != null) {
      url.searchParams.delete("demo");
      const cleaned = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(null, "", cleaned);
    }
  }, [defaultEnabled]);

  const value = useMemo(
    () => ({
      enabled: DEMO_MODE_AVAILABLE && (hydrated ? enabled : defaultEnabled),
      setEnabled,
      toggle,
    }),
    [hydrated, enabled, defaultEnabled, setEnabled, toggle],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}

/** Safe for components that may render outside admin-migrate (returns disabled). */
export function useDemoModeOptional(): DemoModeContextValue {
  return (
    useContext(DemoModeContext) ?? {
      enabled: false,
      setEnabled: () => {},
      toggle: () => {},
    }
  );
}
