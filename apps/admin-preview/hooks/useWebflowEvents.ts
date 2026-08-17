"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { EventFieldSlugs } from "@/lib/webflow/event-field-slugs";
import { DEFAULT_EVENT_FIELD_SLUGS } from "@/lib/webflow/event-field-slugs";

export const WEBFLOW_EVENTS_QUERY_KEY = ["webflow-events"] as const;

/** Option field choices from Get Collection (`validations.options`) or field `metadata`. */
export type WebflowOptionChoice = { id: string; name: string };

export type WebflowCollectionFieldDTO = {
  id: string;
  slug: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  isEditable: boolean;
  validations?: { options?: WebflowOptionChoice[] };
  metadata?: { options?: Array<Partial<WebflowOptionChoice> & { name?: string }> };
};

export type WebflowEventItemDTO = {
  id: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData: Record<string, unknown>;
};

export type WebflowEventsPayload = {
  collection: {
    id: string;
    displayName: string;
    fields: WebflowCollectionFieldDTO[];
  };
  items: WebflowEventItemDTO[];
  calendarFieldSlug: string | null;
  endFieldSlug: string | null;
  titleFieldSlug: string;
  eventFieldSlugs: EventFieldSlugs;
};

export function useWebflowEvents(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: WEBFLOW_EVENTS_QUERY_KEY,
    enabled,
    queryFn: async (): Promise<WebflowEventsPayload> => {
      const res = await fetch(`${getApiBase()}/api/events/webflow`);
      const json = (await res.json()) as WebflowEventsPayload & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Failed to load Webflow events");
      }
      return {
        ...json,
        eventFieldSlugs: json.eventFieldSlugs ?? DEFAULT_EVENT_FIELD_SLUGS,
      };
    },
  });

  return {
    ...query,
    invalidate: () => queryClient.invalidateQueries({ queryKey: WEBFLOW_EVENTS_QUERY_KEY }),
  };
}
