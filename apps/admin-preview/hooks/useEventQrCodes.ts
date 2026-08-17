"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { QrCodes } from "@/types/database";
import type { EventQrLink } from "@/lib/events/eventQr";

export type EventQrCodeRow = QrCodes & {
  description?: string;
};

export function useEventQrCodes(links: EventQrLink[]) {
  const ids = links.map((link) => link.id).filter(Boolean);
  const descriptionById = new Map(
    links.map((link) => [link.id, link.description] as const),
  );

  return useQuery({
    queryKey: ["event-qr-codes", ...ids],
    queryFn: async (): Promise<EventQrCodeRow[]> => {
      if (!ids.length || !supabaseClient) return [];
      const { data, error } = await supabaseClient
        .from("qr_codes")
        .select("*")
        .in("id", ids);
      if (error) throw error;

      const byId = new Map((data ?? []).map((row) => [row.id, row as QrCodes]));
      const result: EventQrCodeRow[] = [];
      for (const id of ids) {
        const row = byId.get(id);
        if (!row) continue;
        result.push({
          ...row,
          description: descriptionById.get(id),
        });
      }
      return result;
    },
    enabled: ids.length > 0,
  });
}
