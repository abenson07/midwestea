"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { CheckCircle2, MessageSquare } from "lucide-react";
import type { DraftCommentCard as DraftCommentCardData } from "@/data/mocks/drafts";

export type DraftCommentCardProps = {
  comment: DraftCommentCardData;
};

export function DraftCommentCard({ comment }: DraftCommentCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} align="center">
          <Icon icon={CheckCircle2} size="sm" color="accent" />
          <Text weight="semibold" style={{ flex: 1 }}>
            {comment.issueTitle}
          </Text>
          <Text color="secondary" size="sm">
            {comment.age}
          </Text>
        </HStack>
        <div style={{ alignSelf: "flex-start" }}>
          <Badge
            variant="neutral"
            label="Commenting on an issue"
            icon={<MessageSquare size={12} strokeWidth={2} />}
          />
        </div>
        <Text color="secondary">{comment.body}</Text>
      </VStack>
    </Card>
  );
}
