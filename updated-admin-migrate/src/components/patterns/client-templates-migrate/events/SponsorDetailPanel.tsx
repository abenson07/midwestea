"use client";

import { Building2, CircleDot, Trophy } from "lucide-react";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { EventSponsorRow } from "@/data/mocks/events";

export type SponsorDetailPanelProps = {
  sponsor: EventSponsorRow;
};

/**
 * Sponsor detail — shown in the outlined side panel when a row is
 * selected from the Sponsors section.
 */
export function SponsorDetailPanel({ sponsor }: SponsorDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Building2 size={20} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)" }} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{sponsor.name}</Text>
          <Text size="sm" color="secondary">
            {sponsor.tier} sponsor
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Sponsorship
          </Text>
        }
      >
        <SideContentField icon={<CircleDot size={16} strokeWidth={1.75} />} label={sponsor.status} />
        <SideContentField icon={<Trophy size={16} strokeWidth={1.75} />} label={`${sponsor.tier} tier`} />
      </List>
    </VStack>
  );
}
