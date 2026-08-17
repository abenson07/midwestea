import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import type { EventListItem } from "@/lib/events/eventData";
import type { EventSummary } from "@/data/mocks/events";

export function toEventSummary(row: EventListItem): EventSummary {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    committee: row.committee ?? "events",
    description: "",
  };
}

export function eventCommitteeBadgeLabel(row: Pick<EventSummary, "committee">): string {
  return COMMITTEE_LABELS[row.committee];
}
