"use client";

import { useMemo, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { eventMocksFor, type EventSponsorRow } from "@/data/mocks/events";
import { listDemoScoped } from "@/lib/demo/demoStore";
import { useDemoGuard } from "hooks";

export type SponsorsListSectionProps = {
  onSelectSponsor?: (row: EventSponsorRow) => void;
  onAddSponsor?: () => void;
  onEditBudget?: () => void;
  onEditLevels?: () => void;
  onSeeAllSponsors?: () => void;
};

const STATUS_COLOR: Record<EventSponsorRow["status"], string> = {
  Confirmed: "#27a644",
  Pending: "#f2c94c",
  Declined: "#8a8f98",
};

const PREVIEW_LIMIT = 5;

export function SponsorsListSection({
  onSelectSponsor,
  onAddSponsor,
  onEditBudget,
  onEditLevels,
  onSeeAllSponsors,
}: SponsorsListSectionProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { store } = useDemoGuard();
  const { eventId, sponsors: liveSponsors } = useEventContext();
  const sponsors: EventSponsorRow[] = useMemo(() => {
    if (demo) {
      return (
        listDemoScoped<EventSponsorRow>("sponsorships", eventId) ??
        eventMocksFor(eventId).sponsors
      );
    }
    return liveSponsors.map((s) => ({
      id: s.id,
      name: s.business,
      tier: s.level,
      status:
        s.status === "paid" || s.status === "confirmed"
          ? ("Confirmed" as const)
          : s.status === "declined"
            ? ("Declined" as const)
            : ("Pending" as const),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, eventId, liveSponsors, store.version]);
  const [menuOpen, setMenuOpen] = useState(false);
  const preview = sponsors.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="sponsors-list-section"
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
        <Text weight="semibold">Sponsors</Text>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {onAddSponsor ? (
            <IconButton
              label="Add sponsor"
              variant="ghost"
              size="sm"
              icon={<Plus size={16} strokeWidth={1.75} />}
              onClick={onAddSponsor}
            />
          ) : null}
          <Dropdown
            label="Sponsor actions"
            open={menuOpen}
            onOpenChange={setMenuOpen}
            placement="below"
            alignment="end"
            trigger={
              <IconButton
                label="More"
                variant="ghost"
                size="sm"
                icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
                isActive={menuOpen}
              />
            }
          >
            <DropdownItem
              label="Edit budget amount"
              onSelect={() => {
                setMenuOpen(false);
                onEditBudget?.();
              }}
            />
            <DropdownItem
              label="Edit sponsorships"
              onSelect={() => {
                setMenuOpen(false);
                onEditLevels?.();
              }}
            />
          </Dropdown>
        </div>
      </div>

      {sponsors.length === 0 ? (
        <EmptyStateCard
          variant="pill"
          label="Add new sponsor"
          onClick={onAddSponsor}
          minHeight={72}
        />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {preview.map((sponsor) => (
              <button
                key={sponsor.id}
                type="button"
                onClick={() => onSelectSponsor?.(sponsor)}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 4px",
                  borderRadius: "var(--linear-radius-sm)",
                  cursor: onSelectSponsor ? "pointer" : "default",
                }}
              >
                <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                  {sponsor.name}
                </Text>
                <Text size="sm" color="secondary">
                  {sponsor.tier}
                </Text>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    width: 84,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: STATUS_COLOR[sponsor.status],
                      flexShrink: 0,
                    }}
                  />
                  <Text size="sm" color="secondary">
                    {sponsor.status}
                  </Text>
                </span>
              </button>
            ))}
          </div>
          {onSeeAllSponsors && sponsors.length > 0 ? (
            <button
              type="button"
              onClick={onSeeAllSponsors}
              style={{
                all: "unset",
                cursor: "pointer",
                marginTop: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--linear-color-accent)",
              }}
            >
              See all sponsors
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
