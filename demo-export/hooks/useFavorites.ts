"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiBase } from "@/lib/apiBase";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import type { UserFavorites } from "@/types/database";

export const FAVORITES_QUERY_KEY = ["favorites"] as const;

async function fetchFavorites(): Promise<UserFavorites[]> {
  const res = await fetch(`${getApiBase()}/api/favorites`);
  const body = (await res.json()) as { error?: string; favorites?: UserFavorites[] };
  if (!res.ok) throw new Error(body.error ?? "Failed to load favorites");
  return body.favorites ?? [];
}

export function useFavorites() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
  });

  const favorites = data ?? [];

  const isFavorite = useCallback(
    (route: string) => {
      const normalized = normalizeRoute(route);
      return favorites.some((fav) => normalizeRoute(fav.route) === normalized);
    },
    [favorites],
  );

  const addFavorite = useCallback(
    async ({ name, route }: { name: string; route: string }) => {
      const normalizedRoute = normalizeRoute(route);
      const previous = queryClient.getQueryData<UserFavorites[]>(FAVORITES_QUERY_KEY) ?? [];
      const optimistic: UserFavorites = {
        id: `optimistic-${normalizedRoute}`,
        user_id: "",
        name,
        route: normalizedRoute,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<UserFavorites[]>(FAVORITES_QUERY_KEY, [...previous, optimistic]);

      try {
        const res = await fetch(`${getApiBase()}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, route: normalizedRoute }),
        });
        const body = (await res.json()) as { error?: string; favorite?: UserFavorites };
        if (!res.ok) throw new Error(body.error ?? "Failed to add favorite");
        await queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
        return body.favorite;
      } catch (err) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, previous);
        toast.error(err instanceof Error ? err.message : "Failed to add favorite");
        throw err;
      }
    },
    [queryClient],
  );

  const removeFavorite = useCallback(
    async (route: string) => {
      const normalizedRoute = normalizeRoute(route);
      const previous = queryClient.getQueryData<UserFavorites[]>(FAVORITES_QUERY_KEY) ?? [];
      queryClient.setQueryData<UserFavorites[]>(
        FAVORITES_QUERY_KEY,
        previous.filter((fav) => normalizeRoute(fav.route) !== normalizedRoute),
      );

      try {
        const res = await fetch(`${getApiBase()}/api/favorites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ route: normalizedRoute }),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? "Failed to remove favorite");
        await queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      } catch (err) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, previous);
        toast.error(err instanceof Error ? err.message : "Failed to remove favorite");
        throw err;
      }
    },
    [queryClient],
  );

  const toggleFavorite = useCallback(
    async ({ name, route }: { name: string; route: string }) => {
      if (isFavorite(route)) {
        await removeFavorite(route);
      } else {
        await addFavorite({ name, route });
      }
    },
    [addFavorite, isFavorite, removeFavorite],
  );

  const favoriteRoutes = useMemo(
    () => new Set(favorites.map((fav) => normalizeRoute(fav.route))),
    [favorites],
  );

  return {
    favorites,
    favoriteRoutes,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
