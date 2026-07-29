"use client";

import { Card } from "@/components/patterns/primitives/Card";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import { Circle } from "lucide-react";
import type { DraftIssueCard as DraftIssueCardData } from "@/data/mocks/drafts";

export type DraftIssueCardProps = {
  issue: DraftIssueCardData;
};

export function DraftIssueCard({ issue }: DraftIssueCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} align="center">
          <Icon icon={Circle} size="sm" color="secondary" />
          <Text weight="semibold" display="block" style={{ flex: 1 }}>
            {issue.title}
          </Text>
          <Text color="secondary" size="sm">
            {issue.age}
          </Text>
        </HStack>
        <Text color="secondary" size="sm">
          Sub issue of{" "}
          <Text as="span" weight="medium">
            {issue.parentLabel}
          </Text>
        </Text>
        <Text color="secondary">Add description...</Text>
      </VStack>
    </Card>
  );
}
