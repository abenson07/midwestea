import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";

export { COMMITTEE_LABELS };

export type CreateCommitteeMeetingInput = {
  committee: CommitteeSlug;
  starts_at: string;
  ends_at?: string | null;
  location_type: "in_person" | "remote" | "hybrid";
  location?: string | null;
  google_calendar_url?: string | null;
};

export function committeeMeetingEventName(
  committee: CommitteeSlug,
  startsAt: string,
): string {
  const label = COMMITTEE_LABELS[committee];
  const d = new Date(startsAt);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${label} — ${dateStr}`;
}

export function meetingWebsiteSlug(
  committee: CommitteeSlug,
  startsAt: string,
): string {
  const d = new Date(startsAt);
  const month = d.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
  const year = d.getFullYear();
  return `${month}-${year}-${committee}-notes`;
}

/** Extract plain text from TipTap JSON for LLM context. */
export function agendaPlainText(agendaJson: Record<string, unknown> | null): string {
  if (!agendaJson) return "";

  const lines: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") {
      lines.push(n.text);
    }
    if (n.type === "mention" && n.attrs && typeof n.attrs === "object") {
      const attrs = n.attrs as Record<string, unknown>;
      const label = typeof attrs.label === "string" ? attrs.label : "Unknown";
      lines.push(`@${label}`);
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        walk(child);
        if (
          child &&
          typeof child === "object" &&
          (child as Record<string, unknown>).type === "paragraph"
        ) {
          lines.push("\n");
        }
      }
    }
  }

  walk(agendaJson);
  return lines.join("").replace(/\n+/g, "\n").trim();
}
