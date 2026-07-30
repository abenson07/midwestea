"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { TrendingUp } from "lucide-react";
import type { DraftUpdateCard as DraftUpdateCardData } from "@/data/mocks/drafts";

export type DraftUpdateCardProps = {
  update: DraftUpdateCardData;
};

export function DraftUpdateCard({ update }: DraftUpdateCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} align="center">
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: 6,
              flexShrink: 0,
              background: `${update.projectColor}33`,
              color: update.projectColor,
            }}
          >
            <TrendingUp size={12} strokeWidth={2.25} />
          </span>
          <Text weight="semibold" style={{ flex: 1 }}>
            {update.projectName}
          </Text>
          <Text color="secondary" size="sm">
            {update.age}
          </Text>
        </HStack>
        <Text color="secondary">{update.body}</Text>
      </VStack>
    </Card>
  );
}
