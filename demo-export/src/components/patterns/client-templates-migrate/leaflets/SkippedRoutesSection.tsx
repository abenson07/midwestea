"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { sampleSkippedRoutes, type LeafletRouteRow } from "@/data/mocks/leaflets";

export type SkippedRoutesSectionProps = {
  routes?: LeafletRouteRow[];
  onSelectRoute?: (row: LeafletRouteRow) => void;
};

/**
 * Skipped-routes box for the Overview page — pairs with the Sponsorships
 * summary in the final row, same boxed shape as `SponsorsListSection`.
 */
export function SkippedRoutesSection({ routes: routesProp, onSelectRoute }: SkippedRoutesSectionProps) {
  const routes = routesProp ?? sampleSkippedRoutes;

  return (
    <section
      data-slot="skipped-routes-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Skipped routes</Text>
        <Text size="sm" color="secondary">
          {routes.length} need a substitute
        </Text>
      </div>

      {routes.length === 0 ? (
        <Text size="sm" color="secondary">
          No skipped routes.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute?.(route)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectRoute ? "pointer" : "default",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--linear-color-sidebar-item-selected)",
                  color: "var(--linear-color-ink-subtle)",
                  fontSize: 10,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {route.initials}
              </span>
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {route.name}
              </Text>
              <Text size="sm" color="secondary">
                {route.detail}
              </Text>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
