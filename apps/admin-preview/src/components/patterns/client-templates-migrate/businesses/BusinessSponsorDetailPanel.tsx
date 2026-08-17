"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Calendar, DollarSign, Trophy } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";
import type { SponsorRow } from "./types";
import { SponsorshipLevelBadge } from "./SponsorshipLevelBadge";
import { DetailsSection, MembershipSection } from "./BusinessSections";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export type BusinessSponsorDetailPanelProps = {
  sponsor: SponsorRow;
  business: BusinessWithDetails;
  onUpdateBusiness: (data: BusinessesUpdate) => void | Promise<void>;
  onUpdateMembership: (data: BusinessMembershipsUpdate) => void | Promise<void>;
};

/** Sponsor detail — shown in the outlined side panel when a row is selected from Sponsors. */
export function BusinessSponsorDetailPanel({
  sponsor,
  business,
  onUpdateBusiness,
  onUpdateMembership,
}: BusinessSponsorDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={sponsor.businessName} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{sponsor.businessName}</Text>
          <Text size="sm" color="secondary">
            {sponsor.sponsorshipLevel[0].toUpperCase() + sponsor.sponsorshipLevel.slice(1)} sponsor
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
        <SideContentField icon={<Trophy size={16} strokeWidth={1.75} />} endContent={<SponsorshipLevelBadge level={sponsor.sponsorshipLevel} />} label="Level" />
        <SideContentField icon={<DollarSign size={16} strokeWidth={1.75} />} label={`${currencyFormatter.format(sponsor.amount)} last sponsored`} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Last sponsored in ${sponsor.lastSponsoredYear}`} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Sponsor since ${sponsor.sponsorSince}`} />
      </List>

      <DetailsSection business={business} onCommit={onUpdateBusiness} />
      <MembershipSection business={business} onCommit={onUpdateMembership} />
    </VStack>
  );
}
