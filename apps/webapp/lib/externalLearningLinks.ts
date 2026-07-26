"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PostgrestError } from "@supabase/supabase-js";

export type ExternalLearningPlatformKey = "jb_learning" | "platinum_ed";

export const EXTERNAL_LEARNING_PLATFORM_DEFAULTS: Record<
  ExternalLearningPlatformKey,
  { label: string; url: string }
> = {
  jb_learning: { label: "JB Learning", url: "https://www.jblearning.com" },
  platinum_ed: { label: "Platinum ED", url: "https://www.platinumed.com" },
};

export type ExternalLearningLink = {
  platform: ExternalLearningPlatformKey;
  label: string;
  url: string;
};

export async function getStudentExternalLearningLinks(
  studentId: string
): Promise<{ links: ExternalLearningLink[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("enrollment_status")
      .eq("student_id", studentId);

    if (error) {
      return { links: null, error: error.message };
    }

    const hasActiveEnrollment = (data || []).some(
      (enrollment: { enrollment_status?: string | null }) =>
        enrollment.enrollment_status !== "removed"
    );

    if (!hasActiveEnrollment) {
      return { links: [], error: null };
    }

    const links: ExternalLearningLink[] = (
      Object.keys(EXTERNAL_LEARNING_PLATFORM_DEFAULTS) as ExternalLearningPlatformKey[]
    ).map((platform) => ({
      platform,
      label: EXTERNAL_LEARNING_PLATFORM_DEFAULTS[platform].label,
      url: EXTERNAL_LEARNING_PLATFORM_DEFAULTS[platform].url,
    }));

    return { links, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { links: null, error: error.message || "Failed to fetch external learning links" };
  }
}
