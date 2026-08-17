"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { BannerView, BannerWriteInput } from "@/lib/webflow/banners";

export const BANNERS_QUERY_KEY = ["banners"] as const;

async function readJsonError(res: Response): Promise<Error> {
  const json = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(json?.error || "Request failed");
}

export function useBanners() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: async (): Promise<BannerView[]> => {
      const res = await fetch(`${getApiBase()}/api/banners`);
      if (!res.ok) throw await readJsonError(res);
      const json = (await res.json()) as { banners: BannerView[] };
      return json.banners;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: async (input: BannerWriteInput): Promise<BannerView> => {
      const res = await fetch(`${getApiBase()}/api/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await readJsonError(res);
      const json = (await res.json()) as { banner: BannerView };
      return json.banner;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: BannerWriteInput;
    }): Promise<BannerView> => {
      const res = await fetch(`${getApiBase()}/api/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await readJsonError(res);
      const json = (await res.json()) as { banner: BannerView };
      return json.banner;
    },
    onSuccess: invalidate,
  });

  return {
    banners: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    create: (input: BannerWriteInput) => createMutation.mutateAsync(input),
    update: (id: string, input: BannerWriteInput) =>
      updateMutation.mutateAsync({ id, input }),
    invalidate,
  };
}
