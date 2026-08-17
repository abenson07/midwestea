"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Routes, RoutesInsert, RoutesUpdate, People } from "@/types/database";

export interface RouteWithDeliverer extends Routes {
  primary_deliverer?: People | null;
}

interface UseRoutesOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    delivererId?: string;
    routeType?: string;
    hasDeliverer?: boolean;
    /** Only routes with primary deliverer */
    claimedOnly?: boolean;
    /** Only routes with no primary deliverer */
    openOnly?: boolean;
  };
}

interface UseRoutesReturn {
  routes: RouteWithDeliverer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: RoutesInsert) => Promise<Routes | null>;
  update: (id: string, data: RoutesUpdate) => Promise<Routes | null>;
  delete: (id: string) => Promise<boolean>;
}

async function fetchRoutesData(filters: UseRoutesOptions["filters"] = {}) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }
  let query = supabaseClient.from("routes").select("*");

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(
      `route_name.ilike.%${searchTerm}%,primary_deliverer_email.ilike.%${searchTerm}%`,
    );
  }

  if (filters?.delivererId) {
    query = query.eq("primary_deliverer_id", filters.delivererId);
  }

  if (filters?.hasDeliverer !== undefined) {
    if (filters.hasDeliverer) {
      query = query.not("primary_deliverer_id", "is", null);
    } else {
      query = query.is("primary_deliverer_id", null);
    }
  }

  if (filters?.claimedOnly) {
    query = query.not("primary_deliverer_id", "is", null);
  }

  if (filters?.openOnly) {
    query = query.is("primary_deliverer_id", null);
  }

  if (filters?.routeType) {
    query = query.eq("route_type", filters.routeType);
  }

  const { data: routesData, error: queryError } = await query.order("route_name", {
    ascending: true,
  });

  if (queryError) {
    throw queryError;
  }

  const delivererIds = new Set<string>();
  (routesData || []).forEach((route) => {
    if (route.primary_deliverer_id) delivererIds.add(route.primary_deliverer_id);
  });

  let deliverersMap = new Map<string, People>();

  if (delivererIds.size > 0) {
    const { data: deliverersData, error: deliverersError } = await supabaseClient
      .from("people")
      .select("*")
      .in("id", Array.from(delivererIds));

    if (!deliverersError && deliverersData) {
      deliverersMap = new Map(deliverersData.map((p) => [p.id, p]));
    }
  }

  const transformedData: RouteWithDeliverer[] = (routesData || []).map((route) => ({
    ...route,
    primary_deliverer: route.primary_deliverer_id
      ? deliverersMap.get(route.primary_deliverer_id) || null
      : null,
  }));

  return transformedData;
}

export function useRoutes(options: UseRoutesOptions = {}): UseRoutesReturn {
  const { autoFetch = true, filters = {} } = options;
  const queryClient = useQueryClient();
  const queryKey = [
    "routes",
    filters.search,
    filters.delivererId,
    filters.routeType,
    filters.hasDeliverer,
    filters.claimedOnly,
    filters.openOnly,
  ];

  const { data: routes = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchRoutesData(filters),
    enabled: autoFetch,
  });

  const createMutation = useMutation({
    mutationFn: async (data: RoutesInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: newRoute, error: insertError } = await supabaseClient
        .from("routes")
        .insert(data)
        .select()
        .single();
      if (insertError) throw insertError;
      return newRoute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoutesUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updatedRoute, error: updateError } = await supabaseClient
        .from("routes")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedRoute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("routes").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const create = async (data: RoutesInsert): Promise<Routes | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: RoutesUpdate): Promise<Routes | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteRoute = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    routes,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch routes") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    delete: deleteRoute,
  };
}
