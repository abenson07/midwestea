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

export type StudentExternalLearningLinkGroup = {
  classId: string;
  className: string;
  links: ExternalLearningLink[];
};

function resolvePlatformLink(
  platform: ExternalLearningPlatformKey,
  tiers: Array<{ label: string | null | undefined; url: string | null | undefined }>
): ExternalLearningLink {
  const defaults = EXTERNAL_LEARNING_PLATFORM_DEFAULTS[platform];
  for (const tier of tiers) {
    if (tier.url) {
      return { platform, label: tier.label || defaults.label, url: tier.url };
    }
  }
  return { platform, label: defaults.label, url: defaults.url };
}

export async function getStudentExternalLearningLinks(
  studentId: string
): Promise<{ groups: StudentExternalLearningLinkGroup[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        enrollment_status,
        classes (
          id,
          class_name,
          jb_learning_label,
          jb_learning_url,
          platinum_ed_label,
          platinum_ed_url,
          courses (
            jb_learning_label,
            jb_learning_url,
            platinum_ed_label,
            platinum_ed_url
          )
        )
      `)
      .eq("student_id", studentId);

    if (error) {
      return { groups: null, error: error.message };
    }

    const activeEnrollments = (data || []).filter(
      (enrollment: any) => enrollment.enrollment_status !== "removed" && enrollment.classes
    );

    const groups: StudentExternalLearningLinkGroup[] = activeEnrollments.map((enrollment: any) => {
      const classRecord = enrollment.classes;
      const course = classRecord.courses;
      const platforms = Object.keys(EXTERNAL_LEARNING_PLATFORM_DEFAULTS) as ExternalLearningPlatformKey[];
      const links = platforms.map((platform) =>
        resolvePlatformLink(platform, [
          { label: classRecord[`${platform}_label`], url: classRecord[`${platform}_url`] },
          { label: course?.[`${platform}_label`], url: course?.[`${platform}_url`] },
        ])
      );
      return { classId: classRecord.id, className: classRecord.class_name, links };
    });

    return { groups, error: null };
  } catch (err) {
    const error = err as PostgrestError;
    return { groups: null, error: error.message || "Failed to fetch external learning links" };
  }
}
