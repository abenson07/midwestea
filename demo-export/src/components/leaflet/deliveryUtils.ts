import type { DeliveryWithRelations } from "hooks";
import type { DeliveryResponse } from "./types";

export function deliveryStatusColorClass(label: string): string {
  if (label === "Open" || label === "Skipped" || label === "Needs cover" || label === "Unassigned") {
    return "text-amber-600";
  }
  if (label === "Rejected") return "text-red-600";
  if (label === "Scheduled") return "text-[#5E6AD2] font-medium";
  return "text-zinc-500";
}

/** Table status labels aligned with integrated-dashboard.pen (Routes). */
export function routesTableStatusLabel(d: DeliveryWithRelations): string {
  if (d.is_skipped) return "Skipped";
  if (d.date_delivered) return "Complete";
  if (!d.person_id) return "Open";
  if (d.response === "needs_cover") return "Needs cover";
  if (d.response === "rejected") return "Rejected";
  return "Covered";
}

/** Table status labels aligned with integrated-dashboard.pen (Open Routes). */
export function openRoutesTableStatusLabel(d: DeliveryWithRelations): string {
  if (d.is_skipped) return "Skipped";
  if (!d.person_id) return "Unassigned";
  if (d.response === "needs_cover") return "Needs cover";
  return routesTableStatusLabel(d);
}

/** Table status labels aligned with integrated-dashboard.pen (Substitutions). */
export function substitutionTableStatusLabel(d: DeliveryWithRelations): string {
  if (!d.person_id) return "Needs cover";
  if (d.response === "confirmed") return "Confirmed";
  return "Scheduled";
}

export function substitutionTableStatusClass(label: string): string {
  if (label === "Scheduled") return "text-[#5E6AD2] font-medium";
  if (label === "Needs cover") return "text-amber-600";
  return "text-zinc-500 font-medium";
}

/** Evaluates simple add/subtract expressions typed into a leaflet count field, e.g. "54-5" -> 49. */
export function evaluateCountExpression(raw: string): number | null {
  const compact = raw.replace(/\s+/g, "");
  if (!/^-?\d+([+-]\d+)*$/.test(compact)) return null;
  const tokens = compact.match(/[+-]?\d+/g);
  if (!tokens) return null;
  return tokens.reduce((sum, token) => sum + Number(token), 0);
}

export function formatCountChange(delta: number | null | undefined): {
  text: string;
  className: string;
} {
  if (delta == null) return { text: "—", className: "text-zinc-500" };
  if (delta > 0) return { text: `+${delta}`, className: "text-green-600" };
  if (delta < 0) return { text: String(delta), className: "text-red-600" };
  return { text: "+0", className: "text-green-600" };
}

export function deliveryStatusLabel(d: DeliveryWithRelations): string {
  if (d.is_skipped) return "Skipped";
  if (d.date_delivered) return "Complete";
  if (d.response === "confirmed") return "Confirmed";
  if (d.response === "needs_cover") return "Needs cover";
  if (d.response === "rejected") return "Rejected";
  if (!d.person_id) return "Open";
  return "Pending";
}

export function responseCounts(deliveries: DeliveryWithRelations[]) {
  let yes = 0;
  let no = 0;
  let unresponsive = 0;
  for (const d of deliveries) {
    if (d.response === "confirmed") yes++;
    else if (d.response === "rejected" || d.response === "needs_cover") no++;
    else if (d.person_id && d.response === "pending") unresponsive++;
  }
  return { yes, no, unresponsive };
}

export function formatResponse(r: DeliveryResponse): string {
  const map: Record<DeliveryResponse, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    needs_cover: "Needs cover",
    rejected: "Rejected",
  };
  return map[r] ?? r;
}

export function exportDeliveriesCsv(
  rows: DeliveryWithRelations[],
  columns: { header: string; value: (d: DeliveryWithRelations) => string }[],
) {
  const header = columns.map((c) => c.header).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => `"${c.value(row).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leaflet-routes.csv";
  a.click();
  URL.revokeObjectURL(url);
}
