"use client";

import { Mail, Megaphone } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { EventPromotionItem } from "@/data/mocks/events";

export type PromotionCardProps = {
  item: EventPromotionItem;
};

const STATUS_COLOR: Record<EventPromotionItem["status"], string> = {
  Sent: "#27a644",
  Scheduled: "#f2c94c",
  Draft: "#8a8f98",
};

export function PromotionCard({ item }: PromotionCardProps) {
  const typeIcon = item.type === "email" ? Mail : Megaphone;
  const statusColor = STATUS_COLOR[item.status];

  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} align="center">
          <Icon icon={typeIcon} size="sm" color="secondary" />
          <Text weight="semibold" display="block" style={{ flex: 1 }}>
            {item.title}
          </Text>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 22,
              paddingInline: 8,
              borderRadius: 999,
              background: `${statusColor}1A`,
              color: statusColor,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: "16px",
              whiteSpace: "nowrap",
            }}
          >
            {item.status}
          </span>
        </HStack>
        <Text color="secondary">{item.description}</Text>
        <HStack gap={2} align="center">
          <Badge label={item.channel} />
          <span style={{ flex: 1 }} />
          <Text color="secondary" size="sm">
            {item.sendDate}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}
