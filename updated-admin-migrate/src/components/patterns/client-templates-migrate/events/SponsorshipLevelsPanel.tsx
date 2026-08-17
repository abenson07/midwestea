"use client";

import { Pencil } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { eventMocksFor } from "@/data/mocks/events";

export type SponsorshipLevelsPanelProps = {
  onEdit?: () => void;
  onSeeAllLevels?: () => void;
};

const PREVIEW_LIMIT = 5;

/**
 * Compact list of sponsorship levels — sits alongside BudgetChart.
 */
export function SponsorshipLevelsPanel({
  onEdit,
  onSeeAllLevels,
}: SponsorshipLevelsPanelProps = {}) {
  const { enabled: demo } = useDemoModeOptional();
  const { eventId, sponsorshipTiers } = useEventContext();

  const levels = demo
    ? eventMocksFor(eventId).sponsorshipLevels
    : sponsorshipTiers.map((tier, index) => ({
        id: `tier-${index}`,
        name: tier.name,
        price: `$${tier.amount.toLocaleString()}`,
        quantityAvailable: tier.quantity,
        quantityFilled: Math.max(tier.quantity - tier.remaining, 0),
      }));
  const preview = levels.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="sponsorship-levels-panel"
      style={{
        boxSizing: "border-box",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        background: "var(--linear-color-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Sponsorship levels</Text>
        {onEdit ? (
          <IconButton
            label="Edit sponsorship levels"
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} strokeWidth={1.75} />}
            onClick={onEdit}
          />
        ) : null}
      </div>

      {levels.length === 0 ? (
        <Text size="sm" color="secondary">
          No levels yet.
        </Text>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {preview.map((level) => (
              <div key={level.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text size="sm">{level.name}</Text>
                  <Text size="sm" color="secondary">
                    {level.quantityFilled}/{level.quantityAvailable}
                  </Text>
                </div>
                <Text size="sm" color="secondary">
                  {level.price}
                </Text>
              </div>
            ))}
          </div>
          {onSeeAllLevels && levels.length > 0 ? (
            <button
              type="button"
              onClick={onSeeAllLevels}
              style={{
                all: "unset",
                cursor: "pointer",
                marginTop: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--linear-color-accent)",
              }}
            >
              See all levels
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
