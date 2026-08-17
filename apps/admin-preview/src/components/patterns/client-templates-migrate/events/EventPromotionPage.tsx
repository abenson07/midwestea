"use client";

import { Fragment, useState } from "react";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { PromotionCard } from "./PromotionCard";
import { PromotionInsertRow } from "./PromotionInsertRow";
import { SentPromotionsBar } from "./SentPromotionsBar";
import type { EventPromotionItem } from "@/data/mocks/events";

export type EventPromotionPageProps = {
  items: EventPromotionItem[];
  onInsertAt: (index: number, item: Omit<EventPromotionItem, "id">) => void;
};

/**
 * Center-constrained timeline of emails/social posts leading up to the
 * event, mirroring the Action Items list. Already-sent items are in the
 * past and can't have anything inserted before or between them, so they
 * collapse into a single expandable bar. A "+" row sits between every
 * upcoming card (and at each end of that section) so a new email or
 * social post can be dropped in at any point in the remaining sequence.
 */
export function EventPromotionPage({ items, onInsertAt }: EventPromotionPageProps) {
  const [isSentExpanded, setIsSentExpanded] = useState(false);

  const sentItems = items.filter((item) => item.status === "Sent");
  const upcomingItems = items.filter((item) => item.status !== "Sent");
  const upcomingStartIndex = sentItems.length;

  return (
    <VStack gap={3}>
      <Text type="label" color="secondary">
        Promotion timeline
      </Text>

      {sentItems.length > 0 ? (
        <SentPromotionsBar
          items={sentItems}
          isExpanded={isSentExpanded}
          onToggle={() => setIsSentExpanded((prev) => !prev)}
        />
      ) : null}

      <PromotionInsertRow onInsert={(item) => onInsertAt(upcomingStartIndex, item)} />

      {upcomingItems.map((item, index) => (
        <Fragment key={item.id}>
          <PromotionCard item={item} />
          <PromotionInsertRow
            onInsert={(newItem) => onInsertAt(upcomingStartIndex + index + 1, newItem)}
          />
        </Fragment>
      ))}
    </VStack>
  );
}
