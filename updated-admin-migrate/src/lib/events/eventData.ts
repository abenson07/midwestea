import type { Events, EventPublishStatus, Sponsorships } from "@/types/database";
import { buildSponsorshipTiers } from "@/components/leaflet/leafletData";
import { isCommitteeSlug, type CommitteeSlug } from "schemas/committee_meetings";
import type { EventQrLink } from "./eventQr";

export type EventKind = "council" | "external" | "committee_meeting";
export type { EventQrLink };

export type EventDocumentAsset = {
  id: string;
  label: string;
  url?: string | null;
};

/** Conventional keys stored in `events.field_data` jsonb. */
export type EventFieldData = {
  location?: string;
  status?: string;
  capacity?: number;
  image_url?: string;
  description?: string;
  kind?: EventKind;
  committee?: string;
  /** Legacy single QR link — prefer `qr_codes` when present. */
  qr_code_id?: string;
  /** Event-scoped QR codes (image generated client-side from each URL). */
  qr_codes?: EventQrLink[];
  webflow_item_id?: string;
  address?: string;
  /** True when location is free-text (not from Places) — address row is shown. */
  location_is_generic?: boolean;
  sponsorship_goal_cents?: number;
  marketing?: { shortDescription: string; body: string; generatedAt: string };
  /** Poster / social / custom materials (admin-migrate Settings). */
  documents?: EventDocumentAsset[];
};

export type EventListItem = {
  id: string;
  title: string;
  date: string;
  day: number;
  month: string;
  monthLabel: string;
  status: string;
  location: string;
  daysUntil: number;
  distributionLabel: string;
  kind: EventKind;
  committee?: CommitteeSlug;
  publishStatus: EventPublishStatus;
};

export type EventEdition = {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  event_template_id: string | null;
  slug: string | null;
  committee?: CommitteeSlug;
  fieldData: EventFieldData;
  /** ISO date (YYYY-MM-DD) for task due-date anchor */
  anchorDate: string | null;
  distributionLabel: string;
  daysUntilLabel: string;
  status: string;
  kind: EventKind;
  publishStatus: EventPublishStatus;
};

function parseEventQrLinks(raw: unknown): EventQrLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const links: EventQrLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || !row.id) continue;
    links.push({
      id: row.id,
      description:
        typeof row.description === "string" && row.description.trim()
          ? row.description.trim()
          : undefined,
    });
  }
  return links.length > 0 ? links : undefined;
}

export function parseEventFieldData(raw: Record<string, unknown> | null | undefined): EventFieldData {
  if (!raw || typeof raw !== "object") return {};
  const fd = raw as EventFieldData;
  return {
    location: typeof fd.location === "string" ? fd.location : undefined,
    status: typeof fd.status === "string" ? fd.status : undefined,
    capacity: typeof fd.capacity === "number" ? fd.capacity : undefined,
    image_url: typeof fd.image_url === "string" ? fd.image_url : undefined,
    description: typeof fd.description === "string" ? fd.description : undefined,
    kind:
      fd.kind === "external"
        ? "external"
        : fd.kind === "committee_meeting"
          ? "committee_meeting"
          : fd.kind === "council"
            ? "council"
            : undefined,
    committee: typeof fd.committee === "string" ? fd.committee : undefined,
    qr_code_id: typeof fd.qr_code_id === "string" ? fd.qr_code_id : undefined,
    qr_codes: parseEventQrLinks(fd.qr_codes),
    webflow_item_id: typeof fd.webflow_item_id === "string" ? fd.webflow_item_id : undefined,
    address: typeof fd.address === "string" ? fd.address : undefined,
    sponsorship_goal_cents:
      typeof fd.sponsorship_goal_cents === "number" ? fd.sponsorship_goal_cents : undefined,
    marketing:
      fd.marketing && typeof fd.marketing === "object"
        ? (fd.marketing as EventFieldData["marketing"])
        : undefined,
  };
}

/** Prefer typed `events.committee`; fall back to legacy field_data.committee slug. */
export function resolveEventCommittee(row: Events): CommitteeSlug | undefined {
  if (row.committee && isCommitteeSlug(row.committee)) return row.committee;
  const fromField = parseEventFieldData(row.field_data).committee;
  return fromField && isCommitteeSlug(fromField) ? fromField : undefined;
}

export function eventPrimaryIso(row: Events): string | null {
  return row.starts_at ?? (row.date ? `${row.date}T12:00:00.000Z` : null);
}

export function eventAnchorDate(row: Events): string | null {
  const iso = eventPrimaryIso(row);
  if (!iso) return null;
  return iso.slice(0, 10);
}

function capitalizeStatus(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function deriveEventStatus(row: Events, fieldData: EventFieldData): string {
  if (fieldData.status) return capitalizeStatus(fieldData.status);
  const now = Date.now();
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return "Completed";
  if (row.starts_at && new Date(row.starts_at).getTime() < now) return "Completed";
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return "Upcoming";
  return "Planning";
}

export function daysUntilEvent(iso: string | null): number {
  if (!iso) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso.slice(0, 10) + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntilEventLabel(iso: string | null): string {
  const diff = daysUntilEvent(iso);
  if (diff < 0) return `${Math.abs(diff)} days since event`;
  if (diff === 0) return "Event is today";
  return `${diff} days until event`;
}

export function formatEventDateRange(row: Events): string {
  const start = row.starts_at ?? (row.date ? `${row.date}T12:00:00` : null);
  if (!start) return "Date TBD";
  const startDate = new Date(start);
  const startStr = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!row.ends_at) return startStr;
  const endDate = new Date(row.ends_at);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  if (sameDay) {
    const timeStr = `${startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return `${startStr} · ${timeStr}`;
  }
  return `${startStr} – ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export function formatEventTimeRange(row: Events): string {
  if (!row.starts_at) return "—";
  const start = new Date(row.starts_at);
  if (!row.ends_at) {
    return start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  const end = new Date(row.ends_at);
  return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function mapEventListItem(row: Events): EventListItem {
  const fieldData = parseEventFieldData(row.field_data);
  const iso = eventPrimaryIso(row);
  const d = iso ? new Date(iso) : null;
  const status = deriveEventStatus(row, fieldData);

  return {
    id: row.id,
    title: row.name ?? "Untitled event",
    date: iso?.slice(0, 10) ?? "",
    day: d ? d.getDate() : 0,
    month: d ? d.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "",
    monthLabel: d
      ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "No date",
    status,
    location: fieldData.location ?? "—",
    daysUntil: daysUntilEvent(iso),
    distributionLabel: formatEventDateRange(row),
    kind: fieldData.kind ?? "council",
    committee: resolveEventCommittee(row),
    publishStatus: row.publish_status,
  };
}

export function mapEventEdition(row: Events): EventEdition {
  const fieldData = parseEventFieldData(row.field_data);
  const iso = eventPrimaryIso(row);

  return {
    id: row.id,
    title: row.name ?? "Untitled event",
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    event_template_id: row.event_template_id,
    slug: row.slug,
    committee: resolveEventCommittee(row),
    fieldData,
    anchorDate: eventAnchorDate(row),
    distributionLabel: formatEventDateRange(row),
    daysUntilLabel: daysUntilEventLabel(iso),
    status: deriveEventStatus(row, fieldData),
    kind: fieldData.kind ?? "council",
    publishStatus: row.publish_status,
  };
}

export function isEventReadOnly(row: Events, fieldData: EventFieldData): boolean {
  if (fieldData.status?.toLowerCase() === "completed") return true;
  if (row.ends_at && new Date(row.ends_at).getTime() < Date.now()) return true;
  return false;
}

export function buildEventBudget(
  sponsorships: Sponsorships[],
  raised: number,
  pledgedAmount: number,
  goalCents?: number | null,
) {
  const goalFromField = goalCents != null && goalCents > 0 ? goalCents / 100 : null;
  const goal =
    goalFromField ??
    (sponsorships.reduce((sum, s) => sum + (s.amount ?? 0), 0) || 15_000);
  const progressPct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  return { goal, raised, pledged: pledgedAmount, progressPct };
}

export { buildSponsorshipTiers };

export function groupEventsByMonth(events: EventListItem[]): [string, EventListItem[]][] {
  const map = new Map<string, EventListItem[]>();
  for (const event of events) {
    const list = map.get(event.monthLabel) ?? [];
    list.push(event);
    map.set(event.monthLabel, list);
  }
  return [...map.entries()];
}

export function eventsOnCalendarDay(events: EventListItem[], year: number, month: number, day: number): EventListItem[] {
  return events.filter((e) => {
    if (!e.date) return false;
    const d = new Date(`${e.date}T12:00:00`);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });
}

export function eventIdsForInvoiceFilter(eventId: string, fieldData: EventFieldData): string[] {
  const ids = [eventId];
  if (fieldData.webflow_item_id) ids.push(fieldData.webflow_item_id);
  return ids;
}

export function eventsListBasePath(pathname: string | null): string {
  if (pathname?.startsWith("/admin-preview/events")) return "/admin-preview/events";
  if (pathname?.startsWith("/admin/events")) return "/admin/events";
  return "/old-admin/events";
}

export function eventsHubBasePath(pathname: string | null): string {
  if (pathname?.startsWith("/admin-preview/events")) return "/admin-preview/events";
  if (pathname?.startsWith("/admin/events")) return "/admin/events";
  return "/old-admin/events-hub";
}
