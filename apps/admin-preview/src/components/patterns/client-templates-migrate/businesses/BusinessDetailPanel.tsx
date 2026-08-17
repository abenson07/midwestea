"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";
import type { BusinessRow } from "./types";
import { DetailsSection, MembershipSection, SponsorshipHistorySection } from "./BusinessSections";

export type BusinessDetailPanelProps = {
  business: BusinessRow;
  rawBusiness: BusinessWithDetails;
  onUpdateBusiness: (data: BusinessesUpdate) => void | Promise<void>;
  onUpdateMembership: (data: BusinessMembershipsUpdate) => void | Promise<void>;
};

/** Business detail — shown in the outlined side panel when a row is selected from All Businesses. */
export function BusinessDetailPanel({
  business,
  rawBusiness,
  onUpdateBusiness,
  onUpdateMembership,
}: BusinessDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={business.businessName} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{business.businessName}</Text>
          <Text size="sm" color="secondary">
            {business.category}
          </Text>
        </div>
      </div>

      <DetailsSection business={rawBusiness} onCommit={onUpdateBusiness} />
      <MembershipSection business={rawBusiness} onCommit={onUpdateMembership} />
      <SponsorshipHistorySection business={rawBusiness} />
    </VStack>
  );
}
