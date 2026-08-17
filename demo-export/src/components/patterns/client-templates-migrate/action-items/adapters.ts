import { meetingGroupLabel, type ActionItemListRow } from "@/lib/committee-meetings/actionItemsPage";
import type { ActionItem } from "./types";

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "No due date";
  try {
    return new Date(value.slice(0, 10)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "No due date";
  }
}

export function toActionItem(row: ActionItemListRow): ActionItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    dueDate: formatDisplayDate(row.due_at),
    // Real action items are always assigned to a person — there's no committee-level assignment.
    assignee: { type: "person", name: row.assignee?.full_name ?? "Unassigned" },
    linkedMeeting: meetingGroupLabel(row.committee_meetings),
    status: row.status,
  };
}
