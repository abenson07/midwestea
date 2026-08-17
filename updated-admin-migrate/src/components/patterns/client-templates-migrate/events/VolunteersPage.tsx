"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage, EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { useEventContext } from "@/components/integrated/events/EventContext";
import {
  useCommitteeInterests,
  useDemoGuard,
  type VolunteerAskWithSignups,
} from "hooks";
import { InterestResponseModal } from "@/components/patterns/client-templates-migrate/committees/InterestResponseModal";
import type { CommitteeInterests } from "@/types/database";
import type { DemoVolunteerAsk } from "@/data/mocks/events";
import { VolunteerReminderModal } from "./EventOverviewModals";

export type EventVolunteerRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Accepted" | "Pending";
  interestId?: string;
} & Record<string, unknown>;

type Subview = "status" | "ask";

const STATUS_ORDER = ["Pending", "Accepted"];
const statusColors: Record<string, string> = {
  Pending: "#f2c94c",
  Accepted: "#27a644",
};

function rowsFromAsks(asks: VolunteerAskWithSignups[]): EventVolunteerRow[] {
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
}

export type VolunteersPageProps = {
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
  demoAsks?: DemoVolunteerAsk[];
  onAddVolunteer?: () => void;
  searchQuery?: string;
};

export function VolunteersPage({
  onSelectVolunteer,
  demoAsks,
  onAddVolunteer,
  searchQuery = "",
}: VolunteersPageProps) {
  const { enabled: demo, guard, sendDemoEmail } = useDemoGuard();
  const { eventId, event, volunteerAsks } = useEventContext();

  const { interests, respondWithEmail, markHandled } = useCommitteeInterests({
    eventId,
    status: "pending",
    autoFetch: Boolean(eventId) && !demo,
  });

  const [selectedInterest, setSelectedInterest] = useState<CommitteeInterests | null>(null);
  const [subview, setSubview] = useState<Subview>("status");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const asks = (demoAsks as unknown as VolunteerAskWithSignups[] | undefined) ?? volunteerAsks;

  const askRows = useMemo(() => rowsFromAsks(asks), [asks]);
  const interestRows: EventVolunteerRow[] = useMemo(
    () =>
      interests.map((interest) => ({
        id: `interest-${interest.id}`,
        name: interest.name,
        role: interest.opportunity_title ?? "Website interest",
        email: interest.contact,
        status: "Pending" as const,
        interestId: interest.id,
      })),
    [interests],
  );

  const data = useMemo(() => {
    const seen = new Set(askRows.map((r) => `${r.name}|${r.email}|${r.role}`));
    const extras = interestRows.filter((r) => !seen.has(`${r.name}|${r.email}|${r.role}`));
    return [...askRows, ...extras];
  }, [askRows, interestRows]);

  const q = (searchQuery || localSearch).trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return data;
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q),
    );
  }, [data, q]);

  const needed = asks.reduce((sum, a) => sum + (a.quantity ?? 0), 0);
  const accepted = data.filter((r) => r.status === "Accepted").length;
  const listed = data.length;
  const filledPct = needed > 0 ? Math.min(100, (accepted / needed) * 100) : 0;
  const listedPct = needed > 0 ? Math.min(100, (listed / needed) * 100) : 0;

  const daysUntil = useMemo(() => {
    if (!event?.starts_at) return 0;
    const start = new Date(event.starts_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [event?.starts_at]);

  const columns: TableColumn<EventVolunteerRow>[] = useMemo(() => {
    const cols: TableColumn<EventVolunteerRow>[] = [
      {
        key: "name",
        header: "Name",
        width: proportional(1, { minWidth: 160 }),
        renderCell: (row) => (
          <RowClickCell
            onClick={() => {
              if (row.interestId) {
                setSelectedInterest(interests.find((i) => i.id === row.interestId) ?? null);
                return;
              }
              onSelectVolunteer?.(row);
            }}
          >
            <Avatar name={row.name} size="sm" />
            <span style={{ marginInlineStart: 8 }}>{row.name}</span>
          </RowClickCell>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: pixel(200),
        renderCell: (row) => (
          <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
          </RowClickCell>
        ),
      },
    ];
    if (subview === "status") {
      cols.push({
        key: "ask",
        header: "Ask",
        width: pixel(180),
        renderCell: (row) => (
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.role}</span>
        ),
      });
    } else {
      cols.push({
        key: "status",
        header: "Status",
        width: pixel(120),
        renderCell: (row) => (
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.status}</span>
        ),
      });
    }
    return cols;
  }, [subview, onSelectVolunteer, interests]);

  if (data.length === 0 && asks.length === 0) {
    return (
      <ClassContentPage>
        <EmptyStateCard variant="pill" label="Add new volunteer" onClick={onAddVolunteer} />
      </ClassContentPage>
    );
  }

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "4fr 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <section
          style={{
            boxSizing: "border-box",
            padding: 20,
            background: "var(--linear-color-panel)",
            border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
            borderRadius: "var(--linear-radius-md)",
            boxShadow: "var(--linear-shadow-panel)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Text weight="semibold">Volunteers</Text>
              <Text size="sm" color="secondary" display="block">
                {accepted} accepted · {listed} listed of {needed || "—"} needed
              </Text>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              height: 12,
              borderRadius: 999,
              overflow: "hidden",
              background: "var(--linear-color-icon-button-secondary)",
            }}
          >
            <div style={{ width: `${filledPct}%`, background: "#27a644" }} />
            <div
              style={{
                width: `${Math.max(listedPct - filledPct, 0)}%`,
                background: "#f2c94c",
              }}
            />
          </div>
        </section>

        <section
          style={{
            boxSizing: "border-box",
            padding: 20,
            background: "var(--linear-color-panel)",
            border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
            borderRadius: "var(--linear-radius-md)",
            boxShadow: "var(--linear-shadow-panel)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Text weight="semibold">Send email</Text>
          <Text size="sm">Event reminder</Text>
          <Text size="sm" color="secondary">
            {daysUntil >= 0 ? `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}` : "Past event date"}
          </Text>
          <Button
            label="Send email"
            variant="secondary"
            size="sm"
            onClick={() => setReminderOpen(true)}
          />
        </section>
      </div>

      <NestedGroupedTable
        title={
          <ViewTabs aria-label="Volunteer grouping">
            <ViewTab
              label="By status"
              selected={subview === "status"}
              onClick={() => setSubview("status")}
            />
            <ViewTab
              label="By ask"
              selected={subview === "ask"}
              onClick={() => setSubview("ask")}
            />
          </ViewTabs>
        }
        titleActions={
          searchOpen ? (
            <input
              type="search"
              placeholder="Search volunteers…"
              value={localSearch}
              autoFocus
              onChange={(e) => setLocalSearch(e.target.value)}
              onBlur={() => {
                if (!localSearch.trim()) setSearchOpen(false);
              }}
              style={{
                boxSizing: "border-box",
                height: 28,
                width: 180,
                paddingInline: 8,
                borderRadius: 6,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: "var(--linear-color-canvas)",
                color: "var(--linear-color-ink)",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            />
          ) : null
        }
        onFilterClick={() => setSearchOpen((open) => !open)}
        onAddClick={onAddVolunteer}
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => (subview === "status" ? row.status : row.role)}
        groupOrder={subview === "status" ? STATUS_ORDER : undefined}
        getGroupMeta={(key) =>
          subview === "status"
            ? { color: statusColors[key], label: key }
            : { label: key }
        }
      />

      <InterestResponseModal
        interest={selectedInterest}
        onClose={() => setSelectedInterest(null)}
        onSend={async (payload) => {
          if (!selectedInterest) return;
          if (demo) {
            await sendDemoEmail({
              subject: payload.subject,
              text: payload.text,
              context: `Committee interest reply, originally to ${selectedInterest.contact}`,
            });
            return;
          }
          await respondWithEmail(selectedInterest.id, payload);
        }}
        onMarkHandled={async () => {
          if (!selectedInterest) return;
          await guard(() => markHandled(selectedInterest.id), { action: "Interest marked handled" });
        }}
      />

      <VolunteerReminderModal
        isOpen={reminderOpen}
        daysUntil={daysUntil}
        recipientCount={data.length}
        onClose={() => setReminderOpen(false)}
        onSend={async (payload) => {
          await sendDemoEmail({
            ...payload,
            context: `Volunteer reminder to ${data.length} people`,
          });
        }}
      />
    </ClassContentPage>
  );
}
