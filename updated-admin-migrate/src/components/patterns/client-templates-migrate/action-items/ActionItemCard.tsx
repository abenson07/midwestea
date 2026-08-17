"use client";

import { Building2, User } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { ActionItem } from "./types";

export type ActionItemCardProps = {
  item: ActionItem;
};

export function ActionItemCard({ item }: ActionItemCardProps) {
  const assigneeIcon = item.assignee.type === "committee" ? Building2 : User;
  const statusLabel =
    item.status === "canceled" ? "Canceled" : item.status === "done" ? "Done" : "Open";

  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} align="center">
          <Text weight="semibold" display="block" style={{ flex: 1 }}>
            {item.title}
          </Text>
          <Badge label={statusLabel} />
          <Text color="secondary" size="sm">
            Due {item.dueDate}
          </Text>
        </HStack>
        <Text color="secondary">{item.description}</Text>
        <HStack gap={2} align="center">
          <Icon icon={assigneeIcon} size="sm" color="secondary" />
          <Text color="secondary" size="sm">
            {item.assignee.name}
          </Text>
          <span style={{ flex: 1 }} />
          <Badge label={item.linkedMeeting} />
        </HStack>
      </VStack>
    </Card>
  );
}
