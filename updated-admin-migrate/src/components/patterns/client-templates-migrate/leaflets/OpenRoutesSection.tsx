"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { sampleOpenRoutes, type LeafletRouteRow } from "@/data/mocks/leaflets";

export type OpenRoutesSectionProps = {
  routes?: LeafletRouteRow[];
  onSelectRoute?: (row: LeafletRouteRow) => void;
  onSeeAllOpenRoutes?: () => void;
};

const STATUS_COLOR: Record<LeafletRouteRow["status"], string> = {
  unassigned: "#eb5757",
  "in-progress": "#27a644",
  skipped: "#8a8f98",
};

const PREVIEW_LIMIT = 5;

/**
 * Open-routes preview for the Overview page — replaces `VolunteersListSection`
 * in the Tasks/Volunteers row for leaflets.
 */
export function OpenRoutesSection({
  routes: routesProp,
  onSelectRoute,
  onSeeAllOpenRoutes,
}: OpenRoutesSectionProps) {
  const routes = routesProp ?? sampleOpenRoutes;
  const preview = routes.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="open-routes-section"
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
        <Text weight="semibold">Open routes</Text>
        <Text size="sm" color="secondary">
          {routes.length} unassigned
        </Text>
      </div>

      {preview.length === 0 ? (
        <Text size="sm" color="secondary">
          All routes are assigned.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {preview.map((route) => (
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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: STATUS_COLOR[route.status],
                    flexShrink: 0,
                  }}
                />
                <Text size="sm" color="secondary">
                  {route.detail}
                </Text>
              </span>
            </button>
          ))}
        </div>
      )}

      {onSeeAllOpenRoutes ? (
        <button
          type="button"
          onClick={onSeeAllOpenRoutes}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--linear-color-accent)",
          }}
        >
          See all open routes
        </button>
      ) : null}
    </section>
  );
}
