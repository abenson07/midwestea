"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEvents } from "hooks";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import {
  mobileEmptyStyle,
  mobileHeaderStyle,
  mobileListRowStyle,
  mobilePageStyle,
  mobileScrollStyle,
  mobileSearchInputStyle,
  mobileTitleStyle,
} from "./mobileStyles";

export function MobileEventsPage() {
  const router = useRouter();
  const base = useAdminBasePath();
  const { events, loading, error } = useEvents();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term) ||
        e.status.toLowerCase().includes(term),
    );
  }, [events, search]);

  return (
    <div style={mobilePageStyle}>
      <header style={mobileHeaderStyle}>
        <h1 style={mobileTitleStyle}>Events</h1>
        <div style={{ marginTop: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            style={mobileSearchInputStyle}
          />
        </div>
      </header>

      <div style={mobileScrollStyle}>
        {error ? (
          <div style={mobileEmptyStyle}>{error}</div>
        ) : loading ? (
          <div style={mobileEmptyStyle}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={mobileEmptyStyle}>No events</div>
        ) : (
          filtered.map((event) => (
            <button
              key={event.id}
              type="button"
              style={mobileListRowStyle}
              onClick={() => router.push(`${base}/events/${event.id}`)}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{event.title}</div>
                <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginTop: 2 }}>
                  {event.date || "No date"}
                  {event.location ? ` · ${event.location}` : ""}
                  {event.publishStatus === "draft" ? " · Draft" : ""}
                </div>
              </div>
              <ChevronRight size={18} strokeWidth={1.75} style={{ opacity: 0.45, flexShrink: 0 }} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
