"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { People, PeopleInsert, PeopleUpdate, Memberships } from "@/types/database";

export interface PersonWithMembership extends People {
  membership?: Memberships | null;
}

interface UsePeopleOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
    hasMembership?: boolean;
    membershipStatus?: string;
    role?: string;
    isExecutiveBoard?: boolean;
  };
}

interface UsePeopleReturn {
  people: PersonWithMembership[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: PeopleInsert) => Promise<People | null>;
  update: (id: string, data: PeopleUpdate) => Promise<People | null>;
  delete: (id: string) => Promise<boolean>;
}

async function fetchPeopleData(filters: UsePeopleOptions["filters"] = {}) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }

  let query = supabaseClient.from("people").select("*");

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(
      `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
    );
  }

  if (filters?.membershipId) {
    query = query.eq("membership_id", filters.membershipId);
  }

  if (filters?.hasMembership !== undefined) {
    if (filters.hasMembership) {
      query = query.not("membership_id", "is", null);
    } else {
      query = query.is("membership_id", null);
    }
  }

  if (filters?.isExecutiveBoard === true) {
    query = query.eq("is_executive_board", true);
  }

  const { data: peopleData, error: queryError } = await query.order("full_name", {
    ascending: true,
  });

  if (queryError) {
    throw new Error(`Failed to fetch people: ${queryError.message || JSON.stringify(queryError)}`);
  }

  const membershipIds = Array.from(
    new Set(
      (peopleData || [])
        .map((p) => p.membership_id)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  let membershipsMap = new Map<string, Memberships>();

  if (membershipIds.length > 0) {
    const { data: membershipsData, error: membershipsError } = await supabaseClient
      .from("memberships")
      .select("*")
      .in("id", membershipIds);

    if (!membershipsError && membershipsData) {
      membershipsMap = new Map(membershipsData.map((m) => [m.id, m]));
    }
  }

  let transformedData: PersonWithMembership[] = (peopleData || []).map((person) => ({
    ...person,
    membership: person.membership_id ? membershipsMap.get(person.membership_id) || null : null,
  }));

  if (filters?.membershipStatus) {
    const statusLower = filters.membershipStatus.toLowerCase();
    transformedData = transformedData.filter(
      (p) => p.membership?.status?.toLowerCase() === statusLower
    );
  }

  if (filters?.role) {
    const roleLower = filters.role.toLowerCase();
    transformedData = transformedData.filter((p) =>
      p.roles?.some((r) => r.toLowerCase() === roleLower)
    );
  }

  if (filters?.isExecutiveBoard === true) {
    transformedData = transformedData.filter((p) => p.is_executive_board === true);
  }

  return transformedData;
}

export function usePeople(options: UsePeopleOptions = {}): UsePeopleReturn {
  const { autoFetch = true, filters = {} } = options;
  const queryClient = useQueryClient();
  const queryKey = [
    "people",
    filters.search,
    filters.membershipId,
    filters.hasMembership,
    filters.membershipStatus,
    filters.role,
    filters.isExecutiveBoard,
  ];

  const { data: people = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchPeopleData(filters),
    enabled: autoFetch,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PeopleInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: newPerson, error: insertError } = await supabaseClient
        .from("people")
        .insert(data)
        .select()
        .single();
      if (insertError) throw insertError;
      return newPerson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PeopleUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updatedPerson, error: updateError } = await supabaseClient
        .from("people")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedPerson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("people").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const create = async (data: PeopleInsert): Promise<People | null> => {
    try {
      const result = await createMutation.mutateAsync(data);
      return result;
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: PeopleUpdate): Promise<People | null> => {
    try {
      const result = await updateMutation.mutateAsync({ id, data });
      return result;
    } catch {
      return null;
    }
  };

  const deletePerson = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    people,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch people") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    delete: deletePerson,
  };
}
