"use client";

import { useState } from "react";
import { useEventContext } from "@/components/integrated/events/EventContext";

/**
 * Shown on admin-migrate event Details when the event is still a draft.
 * "Publish it now" calls the same publish flow as the older admin overview.
 */
export function EventDraftBanner() {
  const { event, publishEvent } = useEventContext();
  const [publishing, setPublishing] = useState(false);

  if (!event || event.publishStatus !== "draft") return null;

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishEvent();
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      <span>
        This event is not yet public on the website.{" "}
        <button
          type="button"
          onClick={() => {
            if (!publishing) void handlePublish();
          }}
          disabled={publishing}
          style={{
            all: "unset",
            cursor: publishing ? "default" : "pointer",
            color: "var(--linear-color-accent)",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          {publishing ? "Publishing…" : "Publish it now."}
        </button>
      </span>
    </div>
  );
}
