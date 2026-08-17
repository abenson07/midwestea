"use client";

import { use } from "react";
import { EventProvider } from "@/components/integrated/events/EventContext";
import { EventDetailDemo } from "@/components/patterns/client-templates-migrate/events";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return (
    <EventProvider eventId={eventId}>
      <EventDetailDemo />
    </EventProvider>
  );
}
