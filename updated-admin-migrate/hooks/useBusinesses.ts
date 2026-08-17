"use client";

import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  Businesses,
  BusinessesInsert,
  BusinessesUpdate,
  Sponsorships,
  BusinessMemberships,
} from "@/types/database";

export interface BusinessWithDetails extends Businesses {
  sponsorships?: Sponsorships[];
  membership?: BusinessMemberships | null;
}

interface UseBusinessesOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
    status?: "active" | "past" | "yet-to-support";
    /** When true, include rows with hidden = true (default lists omit them). */
    includeHidden?: boolean;
    isMember?: boolean;
    isPastSponsor?: boolean;
  };
}

interface UseBusinessesReturn {
  businesses: BusinessWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: BusinessesInsert) => Promise<Businesses | null>;
  update: (id: string, data: BusinessesUpdate) => Promise<Businesses | null>;
  delete: (id: string) => Promise<boolean>;
}

async function fetchBusinessesData(filters: UseBusinessesOptions["filters"] = {}) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }
  let query = supabaseClient.from("businesses").select("*");

  if (!filters?.includeHidden) {
    query = query.eq("hidden", false);
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(
      `business_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,website.ilike.%${searchTerm}%`
    );
  }

  if (filters?.membershipId) {
    query = query.eq("membership_id", filters.membershipId);
  }

  if (filters?.isMember !== undefined) {
    query = query.eq("is_member", filters.isMember);
  }

  if (filters?.isPastSponsor !== undefined) {
    query = query.eq("is_past_sponsor", filters.isPastSponsor);
  }

  const { data: businessesData, error: queryError } = await query.order("business_name", {
    ascending: true,
  });

  if (queryError) {
    throw queryError;
  }

  const businessIds = (businessesData || []).map((b) => b.id);
  let sponsorshipsMap = new Map<string, Sponsorships[]>();
  let membershipsMap = new Map<string, BusinessMemberships>();

  if (businessIds.length > 0) {
    const { data: sponsorshipsData, error: sponsorshipsError } = await supabaseClient
      .from("sponsorships")
      .select("*")
      .in("business_id", businessIds);

    if (!sponsorshipsError && sponsorshipsData) {
      sponsorshipsData.forEach((sponsorship) => {
        if (sponsorship.business_id) {
          if (!sponsorshipsMap.has(sponsorship.business_id)) {
            sponsorshipsMap.set(sponsorship.business_id, []);
          }
          sponsorshipsMap.get(sponsorship.business_id)!.push(sponsorship);
        }
      });
    }

    const membershipIds = (businessesData || [])
      .map((b) => b.membership_id)
      .filter((id): id is string => id !== null && id !== undefined);

    if (membershipIds.length > 0) {
      const { data: membershipsData, error: membershipsError } = await supabaseClient
        .from("business_memberships")
        .select("*")
        .in("id", membershipIds);

      if (!membershipsError && membershipsData) {
        membershipsMap = new Map(membershipsData.map((m) => [m.id, m]));
      }
    }
  }

  let transformedData: BusinessWithDetails[] = (businessesData || []).map((business) => {
    const sponsorships = sponsorshipsMap.get(business.id) || [];
    const membership = business.membership_id
      ? membershipsMap.get(business.membership_id) || null
      : null;
    return {
      ...business,
      is_member: business.is_member ?? false,
      is_past_sponsor: business.is_past_sponsor ?? false,
      sponsorships,
      membership,
    };
  });

  if (filters?.status) {
    transformedData = transformedData.filter((business) => {
      const sponsorships = business.sponsorships || [];
      if (filters.status === "active") {
        return (
          (business.membership && business.membership.status === "active") ||
          sponsorships.some((s) => s.status === "paid" && s.paid_date)
        );
      }
      if (filters.status === "past") {
        return (
          sponsorships.length > 0 &&
          !(
            (business.membership && business.membership.status === "active") ||
            sponsorships.some((s) => s.status === "paid" && s.paid_date)
          )
        );
      }
      if (filters.status === "yet-to-support") {
        return (
          sponsorships.length === 0 &&
          (!business.membership || business.membership.status !== "active")
        );
      }
      return true;
    });
  }

  return transformedData;
}

function patchBusinessesCache(
  queryClient: QueryClient,
  id: string,
  patch: BusinessesUpdate | Businesses,
) {
  queryClient.setQueriesData<BusinessWithDetails[]>(
    { queryKey: ["businesses"] },
    (old) => {
      if (!old) return old;
      return old.map((b) => {
        if (b.id !== id) return b;
        const next = { ...b, ...patch };
        return {
          ...next,
          is_member: next.is_member ?? false,
          is_past_sponsor: next.is_past_sponsor ?? false,
        };
      });
    },
  );
}

export function useBusinesses(options: UseBusinessesOptions = {}): UseBusinessesReturn {
  const { autoFetch = true, filters = {} } = options;
  const queryClient = useQueryClient();
  const queryKey = [
    "businesses",
    filters.search,
    filters.membershipId,
    filters.status,
    filters.includeHidden,
    filters.isMember,
    filters.isPastSponsor,
  ];

  const { data: businesses = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchBusinessesData(filters),
    enabled: autoFetch,
  });

  const createMutation = useMutation({
    mutationFn: async (data: BusinessesInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: newBusiness, error: insertError } = await supabaseClient
        .from("businesses")
        .insert(data)
        .select()
        .single();
      if (insertError) throw insertError;
      return newBusiness;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BusinessesUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updatedBusiness, error: updateError } = await supabaseClient
        .from("businesses")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedBusiness;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["businesses"] });
      const snapshots = queryClient.getQueriesData<BusinessWithDetails[]>({
        queryKey: ["businesses"],
      });
      patchBusinessesCache(queryClient, id, data);
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (updatedBusiness, { id }) => {
      if (updatedBusiness) {
        patchBusinessesCache(queryClient, id, updatedBusiness);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("businesses").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const create = async (data: BusinessesInsert): Promise<Businesses | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: BusinessesUpdate): Promise<Businesses | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteBusiness = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    businesses,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch businesses") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    delete: deleteBusiness,
  };
}
