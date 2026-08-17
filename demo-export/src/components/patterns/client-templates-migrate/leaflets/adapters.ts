import type { DeliveryWithRelations } from "hooks";
import type { Leaflets } from "@/types/database";
import type {
  LeafletDelivererRow,
  LeafletDelivererRouteRow,
  LeafletRouteRow,
  LeafletRouteStatus,
  LeafletSummary,
} from "@/data/mocks/leaflets";
import { sampleDeliverers, sampleOpenRoutes, sampleSkippedRoutes } from "@/data/mocks/leaflets";

export function toLeafletSummary(row: Leaflets): LeafletSummary {
  return {
    id: row.id,
    title: row.title,
    distributionDate: row.distribution_date,
    status: row.status,
  };
}

function responseToStatus(
  responses: Array<string | null | undefined>,
): LeafletDelivererRow["status"] {
  if (responses.every((r) => r === "confirmed")) return "Confirmed";
  if (responses.some((r) => r === "rejected")) return "Declined";
  return "Invited";
}

/** Group live deliveries into deliverer cards (people with ≥1 assignment). */
export function deliveriesToDelivererRows(deliveries: DeliveryWithRelations[]): LeafletDelivererRow[] {
  const byPerson = new Map<string, { personId: string; rows: DeliveryWithRelations[] }>();
  for (const d of deliveries) {
    if (!d.person_id || !d.people) continue;
    const existing = byPerson.get(d.person_id);
    if (existing) existing.rows.push(d);
    else byPerson.set(d.person_id, { personId: d.person_id, rows: [d] });
  }

  return Array.from(byPerson.values())
    .map(({ personId, rows }) => {
      const person = rows[0]!.people!;
      return {
        id: personId,
        name: person.full_name,
        email: person.email ?? "",
        address: person.address ?? "Address not on file",
        status: responseToStatus(rows.map((r) => r.response)),
        routes: rows.map(
          (r): LeafletDelivererRouteRow => ({
            id: r.route_id,
            name: r.routes?.route_name ?? "—",
            leafletCount: r.leaflet_count ?? 0,
            routeType: r.routes?.route_type ?? null,
            deliveryId: r.id,
            routeId: r.route_id,
            isSkipped: r.is_skipped,
          }),
        ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Flatten deliveries into the Routes page table rows. */
export function deliveriesToRouteRows(deliveries: DeliveryWithRelations[]): LeafletRouteRow[] {
  return deliveries.map((d) => {
    const name = d.routes?.route_name ?? "Route";
    let status: LeafletRouteStatus = "unassigned";
    let detail =
      d.leaflet_count != null ? `${d.leaflet_count} addresses` : "— addresses";
    if (d.is_skipped) {
      status = "skipped";
      detail = d.people?.full_name ? `Skipped by ${d.people.full_name}` : "Needs a substitute";
    } else if (d.person_id) {
      status = "in-progress";
      detail = d.people?.full_name ? `Assigned to ${d.people.full_name}` : "Assigned";
    }
    return {
      id: d.id,
      name,
      initials: initialsFromName(d.people?.full_name ?? name),
      detail,
      status,
    };
  });
}

/** Demo routes table: assigned (from deliverers) + open + skipped. */
export function sampleAllRouteRows(): LeafletRouteRow[] {
  const assigned: LeafletRouteRow[] = sampleDeliverers.flatMap((d) =>
    d.routes.map((route) => ({
      id: route.deliveryId ?? route.id,
      name: route.name,
      initials: initialsFromName(d.name),
      detail: `${d.name} · ${route.leafletCount} leaflets`,
      status: "in-progress" as const,
    })),
  );
  return [...assigned, ...sampleOpenRoutes, ...sampleSkippedRoutes];
}

/** Demo open deliveries for Add Route picker (unassigned + skipped). */
export function sampleOpenDeliveriesForPicker(): DeliveryWithRelations[] {
  return [...sampleOpenRoutes, ...sampleSkippedRoutes].map(
    (route) =>
      ({
        id: route.id,
        leaflet_id: "lf-aug-2026",
        route_id: route.id,
        person_id: null,
        leaflet_count: null,
        is_skipped: route.status === "skipped",
        response: "pending",
        date_delivered: null,
        routes: {
          id: route.id,
          route_name: route.name,
          route_type: "street",
        },
        people: null,
      }) as unknown as DeliveryWithRelations,
  );
}
