"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import {
  mobileEmptyStyle,
  mobileHeaderStyle,
  mobilePageStyle,
  mobileScrollStyle,
  mobileTitleStyle,
} from "./mobileStyles";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

export function MobileEventDetail() {
  const router = useRouter();
  const base = useAdminBasePath();
  const { event, loading, error, volunteerSignupTotal, tasksOpenTotal, readOnly } =
    useEventContext();

  return (
    <div style={mobilePageStyle}>
      <header
        style={{
          ...mobileHeaderStyle,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <button
          type="button"
          aria-label="Back to events"
          onClick={() => router.push(`${base}/events`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            marginLeft: -8,
            border: "none",
            borderRadius: 10,
            background: "transparent",
            color: "var(--linear-color-ink)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <div style={{ minWidth: 0, flex: 1, paddingTop: 6 }}>
          <h1
            style={{
              ...mobileTitleStyle,
              fontSize: 18,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event?.title ?? "Event"}
          </h1>
          {event?.publishStatus === "draft" ? (
            <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginTop: 2 }}>
              Draft{readOnly ? " · read-only" : ""}
            </div>
          ) : null}
        </div>
      </header>

      <div style={mobileScrollStyle}>
        {error ? (
          <div style={mobileEmptyStyle}>{error}</div>
        ) : loading || !event ? (
          <div style={mobileEmptyStyle}>Loading…</div>
        ) : (
          <>
            <Field label="Date" value={event.anchorDate ?? "—"} />
            <Field label="Status" value={event.status} />
            <Field label="Location" value={event.fieldData.location ?? "—"} />
            <Field label="Kind" value={event.kind} />
            <Field label="Countdown" value={event.daysUntilLabel} />
            <Field label="Open tasks" value={String(tasksOpenTotal)} />
            <Field label="Volunteer signups" value={String(volunteerSignupTotal)} />
            {event.fieldData.description ? (
              <div style={{ padding: "14px 16px" }}>
                <div
                  style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginBottom: 6 }}
                >
                  Description
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {event.fieldData.description}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
