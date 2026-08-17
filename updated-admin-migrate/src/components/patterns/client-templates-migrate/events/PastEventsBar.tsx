"use client";

import { ChevronDown, ChevronRight, History } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import { EventCard } from "./EventCard";
import type { EventSummary } from "@/data/mocks/events";

export type PastEventsBarProps = {
  events: EventSummary[];
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * Collapsed summary for events that have already happened — mirrors
 * SentPromotionsBar so past events don't crowd the upcoming list.
 */
export function PastEventsBar({ events, isExpanded, onToggle }: PastEventsBarProps) {
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
          <Icon icon={History} size="sm" color="secondary" />
          <Text color="secondary" style={{ flex: 1 }} display="block">
            {events.length} past event{events.length === 1 ? "" : "s"}
          </Text>
        </button>
      </Card>

      {isExpanded ? events.map((event) => <EventCard key={event.id} event={event} />) : null}
    </VStack>
  );
}
