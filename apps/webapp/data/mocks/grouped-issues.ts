import type { IssueRow } from "@/lib/patterns/types";

export type GroupedIssueRow = IssueRow & {
  group: string;
  dueDate?: string;
};

/**
 * Empty on purpose — held sample issue-tracker rows unrelated to midwestea
 * (a different project's tasks) in the source app. Kept as a real,
 * structural piece (GroupedIssuesTable is used by foundation/CanvasContent),
 * just with no fake data behind it.
 */
export const sampleGroupedIssues: GroupedIssueRow[] = [];
