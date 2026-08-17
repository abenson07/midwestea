import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import type { ActionItemStatus } from "@/types/database";

export type ActionItemListRow = {
  id: string;
  title: string;
  description: string | null;
  status: ActionItemStatus;
  due_at: string | null;
  sort_order: number;
  committee_meeting_id: string | null;
  assignee: { id: string; full_name: string; email: string | null } | null;
  committee_meetings: {
    id: string;
    committee: string;
    event_id: string;
    events: { name: string; starts_at: string | null } | null;
  } | null;
};

export type ActionItemMeetingGroup = {
  key: string;
  label: string;
  eventId: string | null;
  meetingStartsAt: string | null;
  openItems: ActionItemListRow[];
  doneItems: ActionItemListRow[];
};

export function actionItemDueLabel(dueAt: string | null): string {
  if (!dueAt) return "No due date";
  const d = new Date(`${dueAt.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (diff < 0) return `Due ${formatted} (${Math.abs(diff)}d overdue)`;
  if (diff === 0) return "Due today";
  return `Due ${formatted}`;
}

export function actionItemIsOverdue(dueAt: string | null, status: ActionItemStatus): boolean {
  if (status === "done" || status === "canceled" || !dueAt) return false;
  const d = new Date(`${dueAt.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

export function meetingGroupLabel(
  meeting: ActionItemListRow["committee_meetings"],
): string {
  if (!meeting) return "Other action items";
  const eventName = meeting.events?.name;
  if (eventName) return eventName;
  const committee = meeting.committee as CommitteeSlug;
  const label = COMMITTEE_LABELS[committee] ?? meeting.committee;
  const starts = meeting.events?.starts_at;
  if (starts) {
    const dateStr = new Date(starts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${label} — ${dateStr}`;
  }
  return label;
}

export function groupActionItemsByMeeting(items: ActionItemListRow[]): ActionItemMeetingGroup[] {
  const map = new Map<string, ActionItemMeetingGroup>();

  for (const item of items) {
    const meeting = item.committee_meetings;
    const key = item.committee_meeting_id ?? "__none__";
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: meetingGroupLabel(meeting),
        eventId: meeting?.event_id ?? null,
        meetingStartsAt: meeting?.events?.starts_at ?? null,
        openItems: [],
        doneItems: [],
      });
    }
    const group = map.get(key)!;
    if (item.status === "done" || item.status === "canceled") group.doneItems.push(item);
    else group.openItems.push(item);
  }

  const sortItems = (a: ActionItemListRow, b: ActionItemListRow) => {
    if (a.due_at && b.due_at) return a.due_at.localeCompare(b.due_at);
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return a.sort_order - b.sort_order;
  };

  const groups = [...map.values()].sort((a, b) => {
    const aTime = a.meetingStartsAt ? new Date(a.meetingStartsAt).getTime() : 0;
    const bTime = b.meetingStartsAt ? new Date(b.meetingStartsAt).getTime() : 0;
    return bTime - aTime;
  });

  for (const group of groups) {
    group.openItems.sort(sortItems);
    group.doneItems.sort(sortItems);
  }

  return groups;
}
