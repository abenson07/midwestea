"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
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
