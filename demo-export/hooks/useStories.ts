"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Stories, StoriesInsert, StoriesUpdate } from "@/types/database";

const STORIES_QUERY_KEY = "stories";

interface UseStoriesOptions {
  autoFetch?: boolean;
  filters?: {
    leafletId?: string | null;
    search?: string;
  };
}

interface UseStoriesReturn {
  stories: Stories[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: StoriesInsert) => Promise<Stories | null>;
  update: (id: string, data: StoriesUpdate) => Promise<Stories | null>;
  remove: (id: string) => Promise<boolean>;
  uploadCoverImage: (file: File) => Promise<string>;
}

async function fetchStoriesData(filters: UseStoriesOptions["filters"] = {}): Promise<Stories[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }

  let query = supabaseClient.from("stories").select("*");

  if (filters?.leafletId) {
    query = query.eq("leaflet_id", filters.leafletId);
  }
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.ilike("title", `%${searchTerm}%`);
  }

  const { data, error: queryError } = await query.order("created_at", { ascending: false });

  if (queryError) {
    throw new Error(`Failed to fetch stories: ${queryError.message || JSON.stringify(queryError)}`);
  }

  return (data ?? []) as Stories[];
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const { autoFetch = true, filters = {} } = options;
  const queryClient = useQueryClient();
  const queryKey = [STORIES_QUERY_KEY, filters.leafletId, filters.search];

  const { data: stories = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchStoriesData(filters),
    enabled: autoFetch,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [STORIES_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: async (data: StoriesInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: newStory, error: insertError } = await supabaseClient
        .from("stories")
        .insert(data)
        .select()
        .single();
      if (insertError) throw insertError;
      return newStory as Stories;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StoriesUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updatedStory, error: updateError } = await supabaseClient
        .from("stories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedStory as Stories;
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("stories").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: invalidate,
  });

  const create = async (data: StoriesInsert): Promise<Stories | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: StoriesUpdate): Promise<Stories | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await removeMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const uploadCoverImage = async (file: File): Promise<string> => {
    if (!supabaseClient) throw new Error("Supabase client is not initialized");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("story-images")
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) throw uploadError;
    const { data } = supabaseClient.storage.from("story-images").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    stories,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch stories") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    remove,
    uploadCoverImage,
  };
}
