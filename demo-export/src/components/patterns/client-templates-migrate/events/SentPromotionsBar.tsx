"use client";

import { ChevronDown, ChevronRight, Send } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import { PromotionCard } from "./PromotionCard";
import type { EventPromotionItem } from "@/data/mocks/events";

export type SentPromotionsBarProps = {
  items: EventPromotionItem[];
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * Collapsed summary for already-sent promotions. These are in the past, so
 * nothing can be inserted before or between them — they collapse into a
 * single expandable bar instead of getting "+" rows.
 */
export function SentPromotionsBar({ items, isExpanded, onToggle }: SentPromotionsBarProps) {
  return (
    <VStack gap={3}>
      <Card padding={3}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            all: "unset",
            boxSizing: "border-box",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Icon icon={isExpanded ? ChevronDown : ChevronRight} size="sm" color="secondary" />
          <Icon icon={Send} size="sm" color="secondary" />
          <Text color="secondary" style={{ flex: 1 }} display="block">
            {items.length} already sent
          </Text>
        </button>
      </Card>

      {isExpanded ? items.map((item) => <PromotionCard key={item.id} item={item} />) : null}
    </VStack>
  );
}
