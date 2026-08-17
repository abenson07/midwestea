"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useDeliveries,
  useDemoGuard,
  type DeliveryWithRelations,
} from "hooks";
import type { DeliveriesUpdate } from "@/types/database";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import {
  sampleDeliverers,
  type LeafletDelivererRouteRow,
  type LeafletDelivererRow,
} from "@/data/mocks/leaflets";
import { listDemoScoped, writeDemoScoped } from "@/lib/demo/demoStore";
import { deliveriesToDelivererRows, sampleOpenDeliveriesForPicker } from "./adapters";
import { AddRouteModal } from "./AddRouteModal";
import {
  RemoveRoutesConfirmModal,
  SkipRouteConfirmModal,
} from "./LeafletRouteActionModals";

type StatusFilter = "all" | LeafletDelivererRow["status"];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Invited", label: "Invited" },
  { value: "Declined", label: "Not confirmed" },
];

const STATUS_LABEL: Record<LeafletDelivererRow["status"], string> = {
  Confirmed: "Confirmed",
  Invited: "Invited",
  Declined: "Not confirmed",
};

const STATUS_COLOR: Record<LeafletDelivererRow["status"], { bg: string; fg: string }> = {
  Confirmed: { bg: "rgba(39, 166, 68, 0.12)", fg: "#27a644" },
  Invited: { bg: "rgba(242, 201, 76, 0.16)", fg: "#a67a00" },
  Declined: { bg: "rgba(242, 153, 74, 0.14)", fg: "#c96a1a" },
};

function StatusBadge({ status }: { status: LeafletDelivererRow["status"] }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: color.bg,
        color: color.fg,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function RouteRowActions({
  route,
  delivererName,
  onSkip,
  onRemove,
}: {
  route: LeafletDelivererRouteRow;
  delivererName: string;
  onSkip: (route: LeafletDelivererRouteRow) => void;
  onRemove: (route: LeafletDelivererRouteRow, delivererName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="leaflet-card-route-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
      <Dropdown
        label="Route actions"
        open={open}
        onOpenChange={setOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="Route actions"
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
          />
        }
      >
        <DropdownItem
          label="Skip route"
          onSelect={() => {
            setOpen(false);
            onSkip(route);
          }}
        />
        <DropdownItem
          label="Remove route"
          onSelect={() => {
            setOpen(false);
            onRemove(route, delivererName);
          }}
        />
      </Dropdown>
    </div>
  );
}

function routeColumns(
  totalLeaflets: number,
  delivererName: string,
  onSkip: (route: LeafletDelivererRouteRow) => void,
  onRemove: (route: LeafletDelivererRouteRow, delivererName: string) => void,
): TableColumn<LeafletDelivererRouteRow>[] {
  return [
    {
      key: "name",
      header: "Route",
      width: proportional(1, { minWidth: 120 }),
      renderCell: (row) => (
        <span
          style={{
            color: row.isSkipped ? "var(--linear-color-ink-subtle)" : "var(--linear-color-ink)",
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      key: "routeType",
      header: "Type",
      width: pixel(90),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.routeType ?? "—"}</span>
      ),
    },
    {
      key: "leafletCount",
      header: `Leaflets (${totalLeaflets})`,
      width: pixel(100),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.leafletCount} leaflets</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: pixel(40),
      renderCell: (row) => (
        <RouteRowActions
          route={row}
          delivererName={delivererName}
          onSkip={onSkip}
          onRemove={onRemove}
        />
      ),
    },
  ];
}

type CardActions = {
  onSelectPerson: (deliverer: LeafletDelivererRow) => void;
  onAddRoute: (deliverer: LeafletDelivererRow) => void;
  onSkipAll: (deliverer: LeafletDelivererRow) => void;
  onRemoveAll: (deliverer: LeafletDelivererRow) => void;
  onSkipRoute: (route: LeafletDelivererRouteRow) => void;
  onRemoveRoute: (route: LeafletDelivererRouteRow, delivererName: string) => void;
};

function DelivererCard({
  deliverer,
  actions,
}: {
  deliverer: LeafletDelivererRow;
  actions: CardActions;
}) {
  const totalLeaflets = deliverer.routes.reduce((sum, route) => sum + route.leafletCount, 0);
  const columns = useMemo(
    () =>
      routeColumns(totalLeaflets, deliverer.name, actions.onSkipRoute, actions.onRemoveRoute),
    [totalLeaflets, deliverer.name, actions.onSkipRoute, actions.onRemoveRoute],
  );
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      data-slot="deliverer-card"
      style={{
        boxSizing: "border-box",
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
        overflow: "hidden",
      }}
    >
      <style>{`
        .leaflet-card-route-actions { opacity: 0; transition: opacity 0.12s ease; }
        .grouped-table-row:hover .leaflet-card-route-actions,
        .leaflet-card-route-actions:focus-within { opacity: 1; }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
          <button
            type="button"
            title={[deliverer.email, deliverer.address].filter(Boolean).join("\n") || undefined}
            onClick={() => actions.onSelectPerson(deliverer)}
            style={{
              all: "unset",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--linear-color-ink)",
            }}
          >
            {deliverer.name}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <StatusBadge status={deliverer.status} />
          <Dropdown
            label="Deliverer actions"
            open={menuOpen}
            onOpenChange={setMenuOpen}
            placement="below"
            alignment="end"
            trigger={
              <IconButton
                label="Deliverer actions"
                variant="ghost"
                size="sm"
                icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
              />
            }
          >
            <DropdownItem
              label="Add route"
              onSelect={() => {
                setMenuOpen(false);
                actions.onAddRoute(deliverer);
              }}
            />
            <DropdownItem
              label="Skip all routes"
              onSelect={() => {
                setMenuOpen(false);
                actions.onSkipAll(deliverer);
              }}
            />
            <DropdownItem
              label="Remove all routes"
              onSelect={() => {
                setMenuOpen(false);
                actions.onRemoveAll(deliverer);
              }}
            />
          </Dropdown>
        </div>
      </div>

      <GroupedTable
        data={deliverer.routes}
        columns={columns}
        getRowKey={(row) => row.id}
        appearance="nested"
        hasHover
      />
    </div>
  );
}

export type LeafletDeliverersPageProps = {
  leafletId: string;
  demo: boolean;
  onSelectDeliverer: (deliverer: LeafletDelivererRow) => void;
};

/**
 * Deliverers as a responsive two-column card grid with hover overflow actions.
 */
export function LeafletDeliverersPage({
  leafletId,
  demo,
  onSelectDeliverer,
}: LeafletDeliverersPageProps) {
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const { deliveries, update, refetch } = useDeliveries(leafletId, { enabled: !isDemo && Boolean(leafletId) });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scopeKey = leafletId || "default";
  const [localDeliverers, setLocalDeliverers] = useState<LeafletDelivererRow[]>(sampleDeliverers);
  const [addFor, setAddFor] = useState<LeafletDelivererRow | null>(null);
  const [skipTarget, setSkipTarget] = useState<{
    label: string;
    deliveryIds: string[];
  } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{
    personName: string;
    deliveryIds: string[];
    allRoutes: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isDemo) return;
    setLocalDeliverers(
      listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers,
    );
  }, [isDemo, scopeKey]);

  function persistDeliverers(next: LeafletDelivererRow[]) {
    setLocalDeliverers(next);
    writeDemoScoped("leafletDeliverers", scopeKey, next);
  }

  const liveDeliverers = useMemo(
    () => (isDemo ? [] : deliveriesToDelivererRows(deliveries)),
    [isDemo, deliveries],
  );
  const deliverers = isDemo ? localDeliverers : liveDeliverers;

  const openDeliveries: DeliveryWithRelations[] = useMemo(() => {
    if (isDemo) return sampleOpenDeliveriesForPicker();
    return deliveries.filter((d) => !d.person_id || d.is_skipped);
  }, [isDemo, deliveries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deliverers.filter((deliverer) => {
      if (statusFilter !== "all" && deliverer.status !== statusFilter) return false;
      if (!q) return true;
      return (
        deliverer.name.toLowerCase().includes(q) ||
        deliverer.email.toLowerCase().includes(q) ||
        deliverer.routes.some((route) => route.name.toLowerCase().includes(q))
      );
    });
  }, [deliverers, query, statusFilter]);

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All statuses";

  async function applyUpdates(ids: string[], patch: DeliveriesUpdate, demoMessage: string) {
    if (isDemo) {
      toast.success(demoMessage);
      return;
    }
    await Promise.all(ids.map((id) => update(id, patch)));
    await refetch();
  }

  async function handleAssign(deliverer: LeafletDelivererRow, delivery: DeliveryWithRelations) {
    if (isDemo) {
      persistDeliverers(
        localDeliverers.map((d) =>
          d.id === deliverer.id
            ? {
                ...d,
                routes: [
                  ...d.routes,
                  {
                    id: delivery.id,
                    name: delivery.routes?.route_name ?? "Route",
                    leafletCount: delivery.leaflet_count ?? 0,
                    routeType: delivery.routes?.route_type ?? null,
                    deliveryId: delivery.id,
                    routeId: delivery.route_id,
                  },
                ],
              }
            : d,
        ),
      );
      toast.success("Route added — demo mode, saved locally only");
      return;
    }
    await update(delivery.id, {
      person_id: deliverer.id,
      is_skipped: false,
      response: "pending",
    });
    await refetch();
    toast.success("Route assigned");
  }

  async function handleSkip() {
    if (!skipTarget) return;
    setSubmitting(true);
    try {
      await applyUpdates(
        skipTarget.deliveryIds,
        { is_skipped: true, response: "needs_cover" },
        "Routes skipped — demo mode, saved locally only",
      );
      if (isDemo) {
        persistDeliverers(
          localDeliverers.map((d) => ({
            ...d,
            routes: d.routes.map((r) =>
              skipTarget.deliveryIds.includes(r.deliveryId ?? r.id)
                ? { ...r, isSkipped: true }
                : r,
            ),
          })),
        );
      }
      setSkipTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setSubmitting(true);
    try {
      await applyUpdates(
        removeTarget.deliveryIds,
        { person_id: null, is_skipped: false, response: "pending" },
        "Routes removed — demo mode, saved locally only",
      );
      if (isDemo) {
        persistDeliverers(
          localDeliverers
            .map((d) => ({
              ...d,
              routes: d.routes.filter(
                (r) => !removeTarget.deliveryIds.includes(r.deliveryId ?? r.id),
              ),
            }))
            .filter((d) => d.routes.length > 0),
        );
      }
      setRemoveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setSubmitting(false);
    }
  }

  const cardActions: CardActions = {
    onSelectPerson: onSelectDeliverer,
    onAddRoute: setAddFor,
    onSkipAll: (deliverer) => {
      const ids = deliverer.routes
        .map((r) => r.deliveryId)
        .filter((id): id is string => Boolean(id));
      if (ids.length === 0) return;
      setSkipTarget({ label: `all routes for ${deliverer.name}`, deliveryIds: ids });
    },
    onRemoveAll: (deliverer) => {
      const ids = deliverer.routes
        .map((r) => r.deliveryId)
        .filter((id): id is string => Boolean(id));
      if (ids.length === 0) return;
      setRemoveTarget({ personName: deliverer.name, deliveryIds: ids, allRoutes: true });
    },
    onSkipRoute: (route) => {
      const id = route.deliveryId ?? route.id;
      setSkipTarget({ label: route.name, deliveryIds: [id] });
    },
    onRemoveRoute: (route, delivererName) => {
      const id = route.deliveryId ?? route.id;
      setRemoveTarget({ personName: delivererName, deliveryIds: [id], allRoutes: false });
    },
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 36,
            paddingInline: 10,
            borderRadius: "var(--linear-radius-md)",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
          }}
        >
          <Search
            size={14}
            strokeWidth={1.75}
            style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search deliverers or routes..."
            style={{
              all: "unset",
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: "var(--linear-color-ink)",
            }}
          />
        </div>

        <Dropdown
          label="Filter by status"
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          placement="below"
          alignment="end"
          trigger={
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isFilterOpen}
              style={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 36,
                paddingInline: 10,
                borderRadius: "var(--linear-radius-md)",
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: isFilterOpen
                  ? "var(--linear-color-sidebar-item-selected)"
                  : "var(--linear-color-canvas)",
                color: "var(--linear-color-ink)",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <Filter
                size={14}
                strokeWidth={1.75}
                style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
              />
              {activeFilterLabel}
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}
              />
            </button>
          }
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              label={option.label}
              selected={statusFilter === option.value}
              onSelect={() => {
                setStatusFilter(option.value);
                setIsFilterOpen(false);
              }}
            />
          ))}
        </Dropdown>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
        className="leaflet-deliverers-grid"
      >
        <style>{`
          @media (max-width: 900px) {
            .leaflet-deliverers-grid {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
        {filtered.length === 0 ? (
          <span style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", padding: "0 4px" }}>
            No deliverers match this filter.
          </span>
        ) : (
          filtered.map((deliverer) => (
            <DelivererCard key={deliverer.id} deliverer={deliverer} actions={cardActions} />
          ))
        )}
      </div>

      <AddRouteModal
        isOpen={addFor != null}
        delivererName={addFor?.name ?? ""}
        openDeliveries={openDeliveries}
        onClose={() => setAddFor(null)}
        onSelect={async (delivery) => {
          if (addFor) await handleAssign(addFor, delivery);
        }}
      />
      <SkipRouteConfirmModal
        isOpen={skipTarget != null}
        routeLabel={skipTarget?.label ?? ""}
        submitting={submitting}
        onCancel={() => setSkipTarget(null)}
        onConfirm={handleSkip}
      />
      <RemoveRoutesConfirmModal
        isOpen={removeTarget != null}
        personName={removeTarget?.personName ?? ""}
        allRoutes={removeTarget?.allRoutes}
        submitting={submitting}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
