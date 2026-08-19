"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { StudentCredentialWithType } from "@midwestea/types";
import type { PostgrestError } from "@supabase/supabase-js";

export async function getMyLatestCredentials(): Promise<{
  credentials: StudentCredentialWithType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { credentials: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("student_credentials")
      .select("*, prerequisite_type:prerequisite_types(*)")
      .eq("student_id", session.user.id)
      .neq("review_status", "superseded")
      .order("submitted_at", { ascending: false });

    if (error) {
      return { credentials: null, error: error.message };
    }

    return { credentials: (data || []) as StudentCredentialWithType[], error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { credentials: null, error: error.message || "Failed to fetch documents" };
  }
}
