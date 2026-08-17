"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useEvents } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Button } from "@/components/patterns/primitives/Button";
import type { EventSummary } from "@/data/mocks/events";
import {
  MobileAdminShell,
  MobileEventsPage,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import { EventsListPage } from "./EventsListPage";
import { NewEventModal } from "./NewEventModal";

export function EventsDemo() {
  const router = useRouter();
  const isMobile = useIsMobileAdmin();
  const { create } = useEvents();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isMobile) {
    return (
      <MobileAdminShell active="events">
        <MobileEventsPage />
      </MobileAdminShell>
    );
  }

  async function handleCreateEvent(event: Omit<EventSummary, "id">) {
    const startsAt = event.date ? new Date(`${event.date}T00:00:00`).toISOString() : new Date().toISOString();
    const created = await create({
      name: event.title,
      starts_at: startsAt,
      committee: event.committee,
      field_data: {
        location: event.location,
        description: event.description,
        committee: event.committee,
        kind: "council",
      },
    });
    if (created) router.push(`/admin-preview/events/${created.id}`);
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: "Events",
              endContent: (
                <Button
                  label="Add event"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
          />
        }
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "auto",
            boxSizing: "border-box",
            padding: "32px 24px 64px",
          }}
        >
          <EventsListPage />
        </div>
      </FoundationLayout>

      <NewEventModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreate={handleCreateEvent} />
    </div>
  );
}
