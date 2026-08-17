"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLeaflets } from "hooks";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import type { LeafletStatus, LeafletSummary } from "@/data/mocks/leaflets";
import { toLeafletSummary } from "./adapters";

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

function groupByMonth(leaflets: LeafletSummary[]): [string, LeafletSummary[]][] {
  const groups = new Map<string, LeafletSummary[]>();
  for (const leaflet of leaflets) {
    const date = new Date(`${leaflet.distributionDate}T12:00:00`);
    const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = groups.get(key);
    if (bucket) bucket.push(leaflet);
    else groups.set(key, [leaflet]);
  }
  return Array.from(groups.entries());
}

/**
 * Leaflets list — month-grouped rows ported from the live admin's
 * `LeafletsListPageContent`, restyled with pattern-library primitives.
 */
export function LeafletsListPage() {
  const router = useRouter();
  const { leaflets, loading, error } = useLeaflets();
  const summaries = useMemo(() => leaflets.map(toLeafletSummary), [leaflets]);
  const byMonth = useMemo(() => groupByMonth(summaries), [summaries]);

  if (error) {
    return <Text color="secondary">Couldn&apos;t load leaflets: {error}</Text>;
  }
  if (loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {byMonth.map(([month, monthLeaflets]) => (
        <section key={month} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text size="sm" weight="semibold" color="secondary">
            {month}
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthLeaflets.map((leaflet) => {
              const date = new Date(`${leaflet.distributionDate}T12:00:00`);
              return (
                <button
                  key={leaflet.id}
                  type="button"
                  onClick={() => router.push(`/admin/leaflets/${leaflet.id}`)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                    padding: 16,
                    background: "var(--linear-color-panel)",
                    border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                    borderRadius: "var(--linear-radius-md)",
                    boxShadow: "var(--linear-shadow-panel)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      flexShrink: 0,
                    }}
                  >
                    <Text weight="semibold" style={{ fontSize: 18, lineHeight: "22px" }}>
                      {date.getDate()}
                    </Text>
                    <Text size="sm" color="secondary">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text weight="medium">{leaflet.title}</Text>
                      <Badge label={statusLabel(leaflet.status)} />
                    </div>
                    <Text size="sm" color="secondary">
                      Distribution{" "}
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
