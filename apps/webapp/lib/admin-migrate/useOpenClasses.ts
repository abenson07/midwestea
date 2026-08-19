"use client";

import { EMPTY_OPEN_CLASS_GROUPS, type StagingOpenClass, type StagingOpenClassGroups } from "./openClasses";
import { useOpenClassesContext } from "./OpenClassesContext";

export type { StagingOpenClass, StagingOpenClassGroups };

/**
 * Open classes for the `/new-admin-migrate` sidebar.
 * The list is loaded in the migrate layout and painted with the first HTML —
 * this hook never fetches, so the rail cannot populate or reorder after load.
 */
export function useStagingOpenClasses(enabled: boolean): StagingOpenClassGroups {
  const groups = useOpenClassesContext();
  return enabled ? groups : EMPTY_OPEN_CLASS_GROUPS;
}
