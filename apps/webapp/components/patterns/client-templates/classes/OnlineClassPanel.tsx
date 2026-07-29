"use client";

import { Clock, CircleDollarSign } from "lucide-react";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text, Heading } from "@/components/patterns/primitives/Text";
import { List } from "@/components/patterns/primitives/List";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { OnlineClassRow } from "@/data/mocks/classes";

export type OnlineClassPanelProps = {
  onlineClass: OnlineClassRow;
};

/** Lightweight, pricing-focused quick-look for an online class. */
export function OnlineClassPanel({ onlineClass }: OnlineClassPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {onlineClass.code}
        </Text>
        <Heading level={2}>{onlineClass.name}</Heading>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Pricing
          </Text>
        }
      >
        <SideContentField
          icon={<CircleDollarSign size={16} strokeWidth={1.75} />}
          label={onlineClass.price}
        />
        <SideContentField
          icon={<Clock size={16} strokeWidth={1.75} />}
          label={onlineClass.duration}
        />
      </List>

      <Text color="secondary" size="sm">
        {onlineClass.isEnabled ? "Currently available for purchase." : "Currently disabled."}
      </Text>
    </VStack>
  );
}
