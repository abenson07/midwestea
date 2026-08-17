"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Calendar, CircleDot, DollarSign, Tag } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate } from "@/types/database";
import type { BusinessMemberRow } from "./types";
import { BusinessMembershipStatusToken } from "./BusinessMembershipStatusToken";
import { DetailsSection, SponsorshipHistorySection } from "./BusinessSections";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export type BusinessMemberDetailPanelProps = {
  businessMember: BusinessMemberRow;
  business: BusinessWithDetails;
  onUpdateBusiness: (data: BusinessesUpdate) => void | Promise<void>;
};

/** Business member detail — shown in the outlined side panel when a row is selected. */
export function BusinessMemberDetailPanel({
  businessMember,
  business,
  onUpdateBusiness,
}: BusinessMemberDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={businessMember.businessName} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{businessMember.businessName}</Text>
          <Text size="sm" color="secondary">
            {businessMember.tier} tier
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Membership
          </Text>
        }
      >
        <SideContentField icon={<CircleDot size={16} strokeWidth={1.75} />} endContent={<BusinessMembershipStatusToken status={businessMember.status} />} label="Status" />
        <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={`${businessMember.tier} tier`} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Renews ${businessMember.renewalDate}`} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Member since ${businessMember.memberSince}`} />
        <SideContentField
          icon={<DollarSign size={16} strokeWidth={1.75} />}
          label={`${currencyFormatter.format(businessMember.annualDues)} annual dues`}
        />
      </List>

      <DetailsSection business={business} onCommit={onUpdateBusiness} />
      <SponsorshipHistorySection business={business} />
    </VStack>
  );
}
