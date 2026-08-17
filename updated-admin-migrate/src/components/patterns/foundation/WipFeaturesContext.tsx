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

type WipFeaturesContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
};

const WipFeaturesContext = createContext<WipFeaturesContextValue | null>(null);

const COOKIE_NAME = "admin-migrate-wip-features";

function readStoredEnabled(defaultEnabled: boolean): boolean {
  if (typeof document === "undefined") return defaultEnabled;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return defaultEnabled;
  return match[1] === "true";
}

function writeStoredEnabled(enabled: boolean) {
  document.cookie = `${COOKIE_NAME}=${enabled ? "true" : "false"}; path=/; max-age=31536000; SameSite=Lax`;
}

export type WipFeaturesProviderProps = {
  children: ReactNode;
  /** Default when nothing is stored. Defaults off — WIP surfaces stay hidden until opted in. */
  defaultEnabled?: boolean;
};

/**
 * Per-browser switch for previewing in-development `/admin-migrate` surfaces
 * (committees, inbox, overview). Backed by a cookie rather than
 * localStorage so `src/middleware.ts` can read it and gate the routes
 * server-side, not just hide nav links client-side.
 */
export function WipFeaturesProvider({
  children,
  defaultEnabled = false,
}: WipFeaturesProviderProps) {
  const [enabled, setEnabledState] = useState(defaultEnabled);
  const [hydrated, setHydrated] = useState(false);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    writeStoredEnabled(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((current) => {
      const next = !current;
      writeStoredEnabled(next);
      return next;
    });
  }, []);

  // Hydrate from cookie, then honor one-shot ?wip=1|0 and strip the param.
  useEffect(() => {
    let next = readStoredEnabled(defaultEnabled);
    const url = new URL(window.location.href);
    const param = url.searchParams.get("wip");
    if (param === "1" || param === "true" || param === "on") {
      next = true;
      writeStoredEnabled(true);
    } else if (param === "0" || param === "false" || param === "off") {
      next = false;
      writeStoredEnabled(false);
    }
    setEnabledState(next);
    setHydrated(true);

    if (param != null) {
      url.searchParams.delete("wip");
      const cleaned = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(null, "", cleaned);
    }
  }, [defaultEnabled]);

  const value = useMemo(
    () => ({ enabled: hydrated ? enabled : defaultEnabled, setEnabled, toggle }),
    [hydrated, enabled, defaultEnabled, setEnabled, toggle],
  );

  return <WipFeaturesContext.Provider value={value}>{children}</WipFeaturesContext.Provider>;
}

export function useWipFeatures() {
  const context = useContext(WipFeaturesContext);
  if (!context) {
    throw new Error("useWipFeatures must be used within a WipFeaturesProvider");
  }
  return context;
}

/** Safe for components that may render outside admin-migrate (returns disabled). */
export function useWipFeaturesOptional(): WipFeaturesContextValue {
  return (
    useContext(WipFeaturesContext) ?? {
      enabled: false,
      setEnabled: () => {},
      toggle: () => {},
    }
  );
}
