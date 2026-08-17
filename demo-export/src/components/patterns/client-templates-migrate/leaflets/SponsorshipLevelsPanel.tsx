"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { useSponsorshipItemOfferings } from "hooks";
import { sampleLeafletSponsorshipLevels } from "@/data/mocks/leaflets";

export type SponsorshipLevelsPanelProps = {
  leafletId?: string | null;
};

/**
 * Compact list of sponsorship levels and how many of each are filled —
 * sits alongside `BudgetChart` in the Sponsorships page's top grid.
 */
export function SponsorshipLevelsPanel({ leafletId = null }: SponsorshipLevelsPanelProps = {}) {
  const { levels: offeringLevels } = useSponsorshipItemOfferings({ leafletId });

  const levels = leafletId
    ? offeringLevels.map((l) => ({
        id: l.offeringId,
        name: l.name,
        price: `$${l.amount.toLocaleString()}`,
        quantityAvailable: l.quantityAvailable,
        quantityFilled: l.quantityFilled,
      }))
    : sampleLeafletSponsorshipLevels;

  return (
    <section
      data-slot="leaflet-sponsorship-levels-panel"
      style={{
        boxSizing: "border-box",
        height: "100%",
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
      <Text weight="semibold" style={{ marginBottom: 8 }}>
        Sponsorship levels
      </Text>

      {levels.length === 0 ? (
        <Text size="sm" color="secondary">
          No levels yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {levels.map((level) => (
            <div key={level.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
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
      )}
    </section>
  );
}
