"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { linearTokenVars } from "@/theme/linearTokens";
import { THEME_STORAGE_KEY } from "@/theme/themeInit";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(defaultMode: ThemeMode): ThemeMode {
  if (typeof window === "undefined") return defaultMode;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : defaultMode;
}

function writeStoredMode(mode: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

function applyDomMode(mode: ThemeMode) {
  document.documentElement.style.colorScheme = mode;
  document.documentElement.dataset.theme = mode;
}

export type ThemeProviderProps = {
  children: ReactNode;
  defaultMode?: ThemeMode;
};

/** Applies `color-scheme` so the kit's `light-dark()` tokens follow it. */
export function ThemeProvider({ children, defaultMode = "dark" }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [hydrated, setHydrated] = useState(false);

  const setMode = useCallback((next: ThemeMode) => {
    writeStoredMode(next);
    applyDomMode(next);
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      writeStoredMode(next);
      applyDomMode(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const next = readStoredMode(defaultMode);
    setModeState(next);
    applyDomMode(next);
    setHydrated(true);
  }, [defaultMode]);

  const value = useMemo(
    () => ({ mode: hydrated ? mode : defaultMode, setMode, toggle }),
    [hydrated, mode, defaultMode, setMode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={
          {
            ...linearTokenVars,
            height: "100%",
            // Inherit the blocking-script value on first paint so SSR's
            // default "dark" does not flash over a stored light mode.
            colorScheme: hydrated ? mode : "inherit",
          } as CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}
