"use client";

import { createSupabaseClient } from "@midwestea/utils";
import { updateCourse, type Course } from "./classes";

export type CourseFieldChange = {
  field_name: string;
  old_value: string | null;
  new_value: string | null;
};

/**
 * Saves edits to a program/course record via the same `updateCourse` +
 * `/api/logs/detail-update` path used by `/admin/programs/[id]`, so edits
 * made from admin-migrate show up in the same audit log.
 */
export async function saveCourseRecord(
  record: Course,
  original: Course,
  referenceType: "program" | "course",
): Promise<{ success: boolean; error?: string }> {
  const { success, error } = await updateCourse(
    record.id,
    record.course_name,
    record.course_code,
    record.programming_offering,
    record.course_image,
    record.length_of_class,
    record.certification_length,
    record.registration_limit,
    record.price,
    record.registration_fee,
    record.stripe_product_id,
  );

  if (!success) return { success: false, error };

  const fieldLabels: [keyof Course, string][] = [
    ["course_name", "name"],
    ["programming_offering", "programming_offering"],
    ["course_image", "course_image"],
    ["length_of_class", "length_of_class"],
    ["certification_length", "certification_length"],
    ["registration_limit", "registration_limit"],
    ["price", "price"],
    ["registration_fee", "registration_fee"],
  ];

  const fieldChanges: CourseFieldChange[] = [];
  for (const [key, label] of fieldLabels) {
    if (original[key] !== record[key]) {
      fieldChanges.push({
        field_name: label,
        old_value: original[key] != null ? String(original[key]) : null,
        new_value: record[key] != null ? String(record[key]) : null,
      });
    }
  }

  if (fieldChanges.length === 0) return { success: true };

  try {
    const supabase = await createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return { success: true };

    await fetch(`/api/logs/detail-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        reference_id: record.id,
        reference_type: referenceType,
        field_changes: fieldChanges,
        batch_id: crypto.randomUUID(),
      }),
    });
  } catch (err) {
    console.error("Failed to log settings change:", err);
  }

  return { success: true };
}
