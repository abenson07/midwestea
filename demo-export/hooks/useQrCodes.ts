"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { QrCodes, QrCodesInsert, QrCodesUpdate } from "@/types/database";

export const QR_CODES_QUERY_KEY = ["qr_codes"] as const;

interface UseQrCodesOptions {
  autoFetch?: boolean;
}

interface UseQrCodesReturn {
  qrCodes: QrCodes[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: QrCodesInsert) => Promise<QrCodes | null>;
  update: (id: string, data: QrCodesUpdate) => Promise<QrCodes | null>;
  delete: (id: string) => Promise<boolean>;
}

async function fetchQrCodes(): Promise<QrCodes[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }
  const { data, error } = await supabaseClient
    .from("qr_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useQrCodes(options: UseQrCodesOptions = {}): UseQrCodesReturn {
  const { autoFetch = true } = options;
  const queryClient = useQueryClient();

  const {
    data: qrCodes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QR_CODES_QUERY_KEY,
    queryFn: fetchQrCodes,
    enabled: autoFetch,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: QrCodesInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: row, error: insertError } = await supabaseClient
        .from("qr_codes")
        .insert(payload)
        .select()
        .single();
      if (insertError) throw insertError;
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_CODES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QrCodesUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: row, error: updateError } = await supabaseClient
        .from("qr_codes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_CODES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("qr_codes").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_CODES_QUERY_KEY });
    },
  });

  const create = async (data: QrCodesInsert): Promise<QrCodes | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: QrCodesUpdate): Promise<QrCodes | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteQrCode = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    qrCodes,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch QR codes") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    delete: deleteQrCode,
  };
}
