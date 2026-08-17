"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Faqs, FaqsInsert, FaqsUpdate } from "@/types/database";

export interface FaqWithPages extends Faqs {
  pages: string[];
}

interface UseFaqsOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
  };
}

interface UseFaqsReturn {
  faqs: FaqWithPages[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: FaqsInsert) => Promise<Faqs | null>;
  update: (id: string, data: FaqsUpdate) => Promise<Faqs | null>;
  remove: (id: string) => Promise<boolean>;
  togglePage: (faqId: string, pageSlug: string, enabled: boolean) => Promise<boolean>;
}

const FAQS_QUERY_KEY = "faqs";

async function fetchFaqsData(filters: UseFaqsOptions["filters"] = {}): Promise<FaqWithPages[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }

  let query = supabaseClient.from("faqs").select("*, faq_page_assignments(page_slug)");

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`);
  }

  const { data, error: queryError } = await query.order("sort_order", { ascending: true });

  if (queryError) {
    throw new Error(`Failed to fetch FAQs: ${queryError.message || JSON.stringify(queryError)}`);
  }

  return (data ?? []).map((row) => {
    const { faq_page_assignments, ...faq } = row as Faqs & {
      faq_page_assignments: { page_slug: string }[] | null;
    };
    return {
      ...faq,
      pages: (faq_page_assignments ?? []).map((assignment) => assignment.page_slug),
    };
  });
}

export function useFaqs(options: UseFaqsOptions = {}): UseFaqsReturn {
  const { autoFetch = true, filters = {} } = options;
  const queryClient = useQueryClient();
  const queryKey = [FAQS_QUERY_KEY, filters.search];

  const { data: faqs = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchFaqsData(filters),
    enabled: autoFetch,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [FAQS_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: async (data: FaqsInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: newFaq, error: insertError } = await supabaseClient
        .from("faqs")
        .insert(data)
        .select()
        .single();
      if (insertError) throw insertError;
      return newFaq;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FaqsUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updatedFaq, error: updateError } = await supabaseClient
        .from("faqs")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedFaq;
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { error: deleteError } = await supabaseClient.from("faqs").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: invalidate,
  });

  const togglePageMutation = useMutation({
    mutationFn: async ({
      faqId,
      pageSlug,
      enabled,
    }: {
      faqId: string;
      pageSlug: string;
      enabled: boolean;
    }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      if (enabled) {
        const { error: insertError } = await supabaseClient
          .from("faq_page_assignments")
          .insert({ faq_id: faqId, page_slug: pageSlug });
        if (insertError) throw insertError;
      } else {
        const { error: deleteError } = await supabaseClient
          .from("faq_page_assignments")
          .delete()
          .eq("faq_id", faqId)
          .eq("page_slug", pageSlug);
        if (deleteError) throw deleteError;
      }
    },
    onSuccess: invalidate,
  });

  const create = async (data: FaqsInsert): Promise<Faqs | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const update = async (id: string, data: FaqsUpdate): Promise<Faqs | null> => {
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

  const togglePage = async (faqId: string, pageSlug: string, enabled: boolean): Promise<boolean> => {
    try {
      await togglePageMutation.mutateAsync({ faqId, pageSlug, enabled });
      return true;
    } catch {
      return false;
    }
  };

  return {
    faqs,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch FAQs") : null,
    refetch: async () => {
      await refetch();
    },
    create,
    update,
    remove,
    togglePage,
  };
}
