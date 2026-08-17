"use client";

import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { linearTokenVars } from "@/theme/linearTokens";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "admin-preview-theme-mode";

function readStoredMode(defaultMode: ThemeMode): ThemeMode {
  if (typeof window === "undefined") return defaultMode;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : defaultMode;
}

export type ThemeProviderProps = {
  children: ReactNode;
  defaultMode?: ThemeMode;
};

/** Applies `color-scheme` so the kit's `light-dark()` tokens follow it. */
export function ThemeProvider({ children, defaultMode = "dark" }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  useEffect(() => {
    setMode(readStoredMode(defaultMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = () => setMode((current) => (current === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <div
        style={
          {
            ...linearTokenVars,
            height: "100%",
            colorScheme: mode,
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
