"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { sampleLeafletSponsors, type LeafletSponsorRow } from "@/data/mocks/leaflets";

export type LeafletSponsorsSectionProps = {
  sponsors?: LeafletSponsorRow[];
  onSelectSponsor?: (row: LeafletSponsorRow) => void;
};

const STATUS_COLOR: Record<LeafletSponsorRow["status"], string> = {
  Confirmed: "#27a644",
  Pending: "#f2c94c",
  Declined: "#8a8f98",
};

/**
 * Sponsorships summary box for the Overview page — pairs with
 * `SkippedRoutesSection` in the final row, mirrors `SponsorsListSection`.
 */
export function LeafletSponsorsSection({
  sponsors: sponsorsProp,
  onSelectSponsor,
}: LeafletSponsorsSectionProps) {
  const sponsors = sponsorsProp ?? sampleLeafletSponsors;
  const confirmedCount = sponsors.filter((s) => s.status === "Confirmed").length;

  return (
    <section
      data-slot="leaflet-sponsors-section"
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
        <Text weight="semibold">Sponsorships</Text>
        <Text size="sm" color="secondary">
          {confirmedCount} confirmed
        </Text>
      </div>

      {sponsors.length === 0 ? (
        <Text size="sm" color="secondary">
          No sponsors yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sponsors.map((sponsor) => (
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
      )}
    </section>
  );
}
