"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListFilter, Plus } from "lucide-react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { EmptyStateCard, RowClickCell } from "@/components/patterns/client-templates/shared";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { useCommitteeMeetingsList, useEvents, type CommitteeMeetingListRow } from "hooks";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import {
  sampleEvents,
  type CuratedDemoEventId,
} from "@/data/mocks/events";
import type { CommitteeSlug } from "schemas/committee_meetings";

export type CommitteeEventsPageProps = {
  committeeSlug: CommitteeSlug;
  onScheduleMeeting: () => void;
  onSelectMeeting: (meetingId: string) => void;
  onAddEvent?: () => void;
};

type MeetingTableRow = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  title: string;
  location: string;
  status: string;
};

type PublicEventTableRow = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  title: string;
  location: string;
  status: string;
};

function formatStackedDate(iso: string | null | undefined): { dateLabel: string; timeLabel: string } {
  if (!iso) return { dateLabel: "TBD", timeLabel: "—" };
  try {
    const d = new Date(iso);
    return {
      dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timeLabel: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { dateLabel: "TBD", timeLabel: "—" };
  }
}

function formatStackedDateDisplay(displayDate: string, fallbackTime = "—"): {
  dateLabel: string;
  timeLabel: string;
} {
  // Demo summaries use "Aug 15, 2026" — take month + day for the stacked top line.
  const match = displayDate.match(/^([A-Za-z]+)\s+(\d+)/);
  if (match) return { dateLabel: `${match[1]} ${match[2]}`, timeLabel: fallbackTime };
  return { dateLabel: displayDate || "TBD", timeLabel: fallbackTime };
}

function meetingStatus(meeting: CommitteeMeetingListRow): string {
  const starts = meeting.events?.starts_at;
  if (meeting.minutes_status === "ready") return "Completed";
  if (starts && new Date(starts).getTime() < Date.now()) return "Past";
  return "Upcoming";
}

function toMeetingRow(meeting: CommitteeMeetingListRow): MeetingTableRow {
  const stacked = formatStackedDate(meeting.events?.starts_at);
  return {
    id: meeting.id,
    dateLabel: stacked.dateLabel,
    timeLabel: stacked.timeLabel,
    title: meeting.events?.name ?? "Committee meeting",
    location: meeting.location ?? "—",
    status: meetingStatus(meeting),
  };
}

function buildMeetingColumns(
  onSelectMeeting: (meetingId: string) => void,
): TableColumn<MeetingTableRow>[] {
  return [
    {
      key: "date",
      header: "Date",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectMeeting(row.id)}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text size="sm">{row.dateLabel}</Text>
            <Text size="sm" color="secondary">
              {row.timeLabel}
            </Text>
          </div>
        </RowClickCell>
      ),
    },
    {
      key: "title",
      header: "Title",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectMeeting(row.id)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.title}</span>
        </RowClickCell>
      ),
    },
    {
      key: "location",
      header: "Location",
      width: pixel(180),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectMeeting(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.location}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectMeeting(row.id)}>
          <Badge label={row.status} />
        </RowClickCell>
      ),
    },
  ];
}

function buildPublicEventColumns(
  onSelect: (id: string) => void,
): TableColumn<PublicEventTableRow>[] {
  return [
    {
      key: "date",
      header: "Date",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text size="sm">{row.dateLabel}</Text>
            <Text size="sm" color="secondary">
              {row.timeLabel}
            </Text>
          </div>
        </RowClickCell>
      ),
    },
    {
      key: "title",
      header: "Title",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.title}</span>
        </RowClickCell>
      ),
    },
    {
      key: "location",
      header: "Location",
      width: pixel(180),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.location}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.status}</span>
        </RowClickCell>
      ),
    },
  ];
}

function demoPublicEventsForCommittee(committeeSlug: CommitteeSlug): PublicEventTableRow[] {
  const demoTimes: Record<string, string> = {
    "evt-summer-social": "4:00 PM",
    "evt-movies-tower": "7:30 PM",
    "evt-book-club": "6:00 PM",
    "evt-community-meeting": "7:00 PM",
    "evt-halloween-parade": "5:00 PM",
  };

  return sampleEvents
    .filter((e) => e.committee === committeeSlug)
    .map((e) => {
      const stacked = formatStackedDateDisplay(
        e.date,
        demoTimes[e.id as CuratedDemoEventId] ?? "—",
      );
      return {
        id: e.id,
        dateLabel: stacked.dateLabel,
        timeLabel: stacked.timeLabel,
        title: e.title,
        location: e.location,
        status: "Upcoming",
      };
    });
}

/**
 * Events tab — two NestedGroupedTables (meetings, then public events),
 * Stories-style stacked date/time cells.
 */
export function CommitteeEventsPage({
  committeeSlug,
  onScheduleMeeting,
  onSelectMeeting,
  onAddEvent,
}: CommitteeEventsPageProps) {
  const router = useRouter();
  const { enabled: demo } = useDemoModeOptional();
  const { meetings, loading: meetingsLoading, error: meetingsError } =
    useCommitteeMeetingsList(committeeSlug);
  const { events, loading: eventsLoading } = useEvents({ autoFetch: !demo });

  const meetingRows = useMemo(() => meetings.map(toMeetingRow), [meetings]);
  const meetingColumns = useMemo(
    () => buildMeetingColumns(onSelectMeeting),
    [onSelectMeeting],
  );

  const publicRows = useMemo((): PublicEventTableRow[] => {
    if (demo) return demoPublicEventsForCommittee(committeeSlug);
    return events
      .filter((e) => e.kind !== "committee_meeting" && e.committee === committeeSlug)
      .map((e) => {
        let dateLabel = "TBD";
        if (e.date) {
          try {
            dateLabel = new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          } catch {
            dateLabel = e.date;
          }
        }
        const timeLabel = e.distributionLabel.includes("·")
          ? e.distributionLabel.split("·").pop()!.trim()
          : e.distributionLabel && !e.distributionLabel.includes(",")
            ? e.distributionLabel
            : "—";
        return {
          id: e.id,
          dateLabel,
          timeLabel,
          title: e.title,
          location: e.location || "—",
          status: e.status || e.publishStatus || "—",
        };
      });
  }, [demo, events, committeeSlug]);

  const publicColumns = useMemo(
    () =>
      buildPublicEventColumns((id) => {
        router.push(`/admin/events/${encodeURIComponent(id)}`);
      }),
    [router],
  );

  function renderEmptySection(opts: {
    title: string;
    ctaLabel: string;
    onAdd?: () => void;
  }) {
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            minHeight: 32,
            paddingInline: 4,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              fontWeight: 500,
              color: "var(--linear-color-ink)",
            }}
          >
            {opts.title}
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <IconButton
              label="Filter"
              variant="ghost"
              size="sm"
              icon={<ListFilter size={14} strokeWidth={2} />}
            />
            <IconButton
              label="Add"
              variant="ghost"
              size="sm"
              icon={<Plus size={14} strokeWidth={2} />}
              onClick={opts.onAdd}
            />
          </div>
        </div>
        <EmptyStateCard
          variant="pill"
          label={opts.ctaLabel}
          onClick={opts.onAdd}
          minHeight={96}
        />
      </section>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        padding: "24px 0 64px",
        boxSizing: "border-box",
      }}
    >
      {meetingsError ? (
        <Text size="sm" color="secondary">
          Couldn&apos;t load meetings: {meetingsError}
        </Text>
      ) : meetingsLoading ? (
        <Text size="sm" color="secondary">
          Loading meetings…
        </Text>
      ) : meetingRows.length === 0 ? (
        renderEmptySection({
          title: "Committee meetings",
          ctaLabel: "Add new committee meeting",
          onAdd: onScheduleMeeting,
        })
      ) : (
        <NestedGroupedTable
          title="Committee meetings"
          data={meetingRows as Array<MeetingTableRow & Record<string, unknown>>}
          columns={meetingColumns as TableColumn<MeetingTableRow & Record<string, unknown>>[]}
          getRowKey={(row) => row.id}
          onAddClick={onScheduleMeeting}
        />
      )}

      {eventsLoading && !demo ? (
        <Text size="sm" color="secondary">
          Loading events…
        </Text>
      ) : publicRows.length === 0 ? (
        renderEmptySection({
          title: "Public events",
          ctaLabel: "Add new event",
          onAdd: onAddEvent,
        })
      ) : (
        <NestedGroupedTable
          title="Public events"
          data={publicRows as Array<PublicEventTableRow & Record<string, unknown>>}
          columns={publicColumns as TableColumn<PublicEventTableRow & Record<string, unknown>>[]}
          getRowKey={(row) => row.id}
          onAddClick={onAddEvent}
        />
      )}
    </div>
  );
}
