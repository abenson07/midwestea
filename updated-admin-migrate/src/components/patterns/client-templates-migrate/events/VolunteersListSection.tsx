"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { eventMocksFor, type DemoVolunteerAsk } from "@/data/mocks/events";
import { listDemoScoped } from "@/lib/demo/demoStore";
import { useDemoGuard } from "hooks";
import type { EventVolunteerRow } from "./VolunteersPage";

export type VolunteersListSectionProps = {
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
  onSeeAllVolunteers?: () => void;
  onAddVolunteer?: () => void;
};

const STATUS_COLOR: Record<EventVolunteerRow["status"], string> = {
  Accepted: "#27a644",
  Pending: "#f2c94c",
};

const PREVIEW_LIMIT = 5;

export function VolunteersListSection({
  onSelectVolunteer,
  onSeeAllVolunteers,
  onAddVolunteer,
}: VolunteersListSectionProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { store } = useDemoGuard();
  const { eventId, volunteerAsks } = useEventContext();
  const asks = useMemo(() => {
    if (!demo) return volunteerAsks;
    return (
      listDemoScoped<DemoVolunteerAsk>("eventAsks", eventId) ??
      eventMocksFor(eventId).volunteerAsks
    );
    // store.version refreshes after local volunteer adds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, eventId, volunteerAsks, store.version]);

  const volunteers: EventVolunteerRow[] = useMemo(() => {
    const rows: EventVolunteerRow[] = [];
    for (const ask of asks) {
      for (const signup of ask.signups) {
        rows.push({
          id: signup.id,
          name: signup.person?.full_name ?? "Unknown",
          role: ask.title,
          email: signup.person?.email ?? signup.person?.phone ?? "—",
          status: signup.status === "pending" ? "Pending" : "Accepted",
        });
      }
    }
    return rows;
  }, [asks]);

  const preview = volunteers.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="volunteers-list-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text weight="semibold">Volunteers</Text>
        {onAddVolunteer ? (
          <IconButton
            label="Add volunteer"
            variant="ghost"
            size="sm"
            icon={<Plus size={16} strokeWidth={1.75} />}
            onClick={onAddVolunteer}
          />
        ) : null}
      </div>

      {preview.length === 0 ? (
        <EmptyStateCard
          variant="pill"
          label="Add new volunteer"
          onClick={onAddVolunteer}
          minHeight={72}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {preview.map((volunteer) => (
            <button
              key={volunteer.id}
              type="button"
              onClick={() => onSelectVolunteer?.(volunteer)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectVolunteer ? "pointer" : "default",
              }}
            >
              <Avatar name={volunteer.name} size="sm" />
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {volunteer.name}
              </Text>
              <Text size="sm" color="secondary">
                {volunteer.role}
              </Text>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  width: 84,
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: STATUS_COLOR[volunteer.status],
                    flexShrink: 0,
                  }}
                />
                <Text size="sm" color="secondary">
                  {volunteer.status}
                </Text>
              </span>
            </button>
          ))}
        </div>
      )}

      {onSeeAllVolunteers && preview.length > 0 ? (
        <button
          type="button"
          onClick={onSeeAllVolunteers}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--linear-color-accent)",
          }}
        >
          See all volunteers
        </button>
      ) : null}
    </section>
  );
}
