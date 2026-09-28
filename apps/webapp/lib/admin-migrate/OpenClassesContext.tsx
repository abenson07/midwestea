"use client";

import { createContext, useContext, type ReactNode } from "react";
import { EMPTY_OPEN_CLASS_GROUPS, type StagingOpenClassGroups } from "./openClasses";

const OpenClassesContext = createContext<StagingOpenClassGroups>(EMPTY_OPEN_CLASS_GROUPS);

export function OpenClassesProvider({
  value,
  children,
}: {
  value: StagingOpenClassGroups;
  children: ReactNode;
}) {
  return <OpenClassesContext.Provider value={value}>{children}</OpenClassesContext.Provider>;
}

export function useOpenClassesContext(): StagingOpenClassGroups {
  return useContext(OpenClassesContext);
}
