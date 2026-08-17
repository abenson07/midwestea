"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { QrCodes } from "@/types/database";

export function useLeafletQr(qrCodeId: string | null | undefined) {
  return useQuery({
    queryKey: ["leaflet-qr", qrCodeId],
    queryFn: async (): Promise<QrCodes | null> => {
      if (!qrCodeId || !supabaseClient) return null;
      const { data, error } = await supabaseClient
        .from("qr_codes")
        .select("*")
        .eq("id", qrCodeId)
        .maybeSingle();
      if (error) throw error;
      return data as QrCodes | null;
    },
    enabled: Boolean(qrCodeId),
  });
}
