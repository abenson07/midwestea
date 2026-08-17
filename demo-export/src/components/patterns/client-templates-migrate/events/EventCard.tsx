"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { EventSummary } from "@/data/mocks/events";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";

export type EventCardProps = {
  event: EventSummary;
};

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  return (
    <Card
      padding={4}
      style={{ cursor: "pointer" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/admin/events/${event.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push(`/admin/events/${event.id}`);
          }
        }}
      >
        <VStack gap={2}>
          <HStack gap={2} align="center">
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {event.title}
            </Text>
            <Badge label={COMMITTEE_LABELS[event.committee]} />
          </HStack>
          <Text color="secondary">{event.description}</Text>
          <HStack gap={2} align="center">
            <Icon icon={CalendarDays} size="sm" color="secondary" />
            <Text color="secondary" size="sm">
              {event.date}
            </Text>
            <span style={{ flex: 1 }} />
            <Icon icon={MapPin} size="sm" color="secondary" />
            <Text color="secondary" size="sm">
              {event.location}
            </Text>
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}
