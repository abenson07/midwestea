export type NestedProjectRow = {
  id: string;
  name: string;
  group: string;
  health: string;
  priority: string;
  lead: string;
  targetDate: string;
  statusLabel: string;
  statusPercent: number;
  color: string;
};

/**
 * Empty on purpose — held sample project rows unrelated to midwestea in the
 * source app. Kept as a real, structural piece (NestedProjectsTable is used
 * by foundation/mixed-content), just with no fake data behind it.
 */
export const sampleNestedProjects: NestedProjectRow[] = [];
