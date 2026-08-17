"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { useCommitteeMeetingsList, type CommitteeMeetingListRow } from "hooks";
import type { CommitteeSlug } from "schemas/committee_meetings";

export type CommitteeMeetingsSectionProps = {
  committee: CommitteeSlug;
  onSchedule?: () => void;
  onSelectMeeting?: (meetingId: string) => void;
};

function formatMeetingRow(meeting: CommitteeMeetingListRow): {
  date: string;
  topic: string;
  status: string;
} {
  const starts = meeting.events?.starts_at;
  const date = starts
    ? new Date(starts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";
  const topic = meeting.events?.name ?? "Committee meeting";
  let status = "Upcoming";
  if (meeting.minutes_status === "ready") status = "Completed";
  else if (starts && new Date(starts).getTime() < Date.now()) status = "Past";
  return { date, topic, status };
}

export function CommitteeMeetingsSection({
  committee,
  onSchedule,
  onSelectMeeting,
}: CommitteeMeetingsSectionProps) {
  const router = useRouter();
  const { meetings, loading, error } = useCommitteeMeetingsList(committee);
  const upcomingCount = meetings.filter((m) => {
    const starts = m.events?.starts_at;
    return starts && new Date(starts).getTime() >= Date.now() && m.minutes_status !== "ready";
  }).length;

  return (
    <section
      data-slot="committee-meetings-section"
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Meetings</Text>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text size="sm" color="secondary">
            {loading ? "…" : `${upcomingCount} upcoming`}
          </Text>
          {onSchedule ? <Button label="Schedule" size="sm" onClick={onSchedule} /> : null}
        </div>
      </div>

      {error ? (
        <Text size="sm" color="secondary">
          Couldn&apos;t load meetings: {error}
        </Text>
      ) : loading ? (
        <Text size="sm" color="secondary">
          Loading…
        </Text>
      ) : meetings.length === 0 ? (
        <Text size="sm" color="secondary">
          No meetings scheduled yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {meetings.map((meeting) => {
            const row = formatMeetingRow(meeting);
            return (
              <button
                key={meeting.id}
                type="button"
                onClick={() => {
                  if (onSelectMeeting) onSelectMeeting(meeting.id);
                  else
                    router.push(
                      `/admin-preview/committees/${encodeURIComponent(committee)}/meetings/${encodeURIComponent(meeting.id)}`,
                    );
                }}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 4px",
                  borderRadius: "var(--linear-radius-sm)",
                  cursor: "pointer",
                }}
              >
                <Text size="sm" color="secondary" style={{ width: 84, flexShrink: 0 }}>
                  {row.date}
                </Text>
                <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                  {row.topic}
                </Text>
                <Badge label={row.status} />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
