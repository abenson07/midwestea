"use client";

import { useMemo, useState } from "react";
import { useDemoGuard, useEvents } from "hooks";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleEvents, type EventSummary } from "@/data/mocks/events";
import { EventCard } from "./EventCard";
import { PastEventsBar } from "./PastEventsBar";
import { toEventSummary } from "./adapters";

function isPastEvent(event: EventSummary): boolean {
  const date = new Date(event.date);
  if (Number.isNaN(date.getTime())) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date < startOfToday;
}

/** Events body — stacked list of upcoming event cards, mirroring Action Items. */
export function EventsListPage() {
  const { enabled: demo } = useDemoModeOptional();
  const { store } = useDemoGuard();
  const { events, loading, error } = useEvents();
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const summaries = useMemo(
    () => (demo ? store.merge<EventSummary>("events", sampleEvents) : events.map(toEventSummary)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demo, events, store.version],
  );

  const upcomingEvents = useMemo(
    () => summaries.filter((event) => !isPastEvent(event)),
    [summaries],
  );
  const pastEvents = useMemo(
    () => summaries.filter((event) => isPastEvent(event)),
    [summaries],
  );

  if (!demo && error) {
    return <Text color="secondary">Couldn&apos;t load events: {error}</Text>;
  }
  if (!demo && loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  return (
    <VStack gap={6}>
      <DraftsSection title="Upcoming Events" columns={1}>
        {upcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </DraftsSection>

      {pastEvents.length > 0 ? (
        <PastEventsBar
          events={pastEvents}
          isExpanded={isPastExpanded}
          onToggle={() => setIsPastExpanded((prev) => !prev)}
        />
      ) : null}
    </VStack>
  );
}
