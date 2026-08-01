"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type {
  ClassPrerequisiteWithType,
  PrerequisiteExpirationRule,
  PrerequisiteInputType,
  PrerequisiteType,
  TemplatePrerequisiteWithType,
} from "@midwestea/types";

/**
 * Fetch all non-archived prerequisite types from the catalog, ordered by name.
 */
export async function getPrerequisiteTypes(): Promise<{
  prerequisiteTypes: PrerequisiteType[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("prerequisite_types")
      .select("*")
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (error) {
      return { prerequisiteTypes: null, error: error.message };
    }

    return { prerequisiteTypes: data as PrerequisiteType[], error: null };
  } catch (err) {
    const error = err as Error;
    return { prerequisiteTypes: null, error: error.message || "Failed to fetch prerequisite types" };
  }
}

export interface PrerequisiteTypeInput {
  name: string;
  input_type: PrerequisiteInputType;
  description?: string | null;
  required_by_default?: boolean;
  expiration_rule?: PrerequisiteExpirationRule;
  expiration_duration_months?: number | null;
}

function mapPrerequisiteTypeError(error: any): string {
  if (error?.code === "23505") {
    return "A prerequisite with this name and input type already exists.";
  }
  if (error?.code === "23514") {
    return "Expiration settings are not valid for the selected rule.";
  }
  return error?.message || "Failed to save prerequisite type";
}

function normalizeExpirationDuration(
  input: Partial<PrerequisiteTypeInput>
): Partial<PrerequisiteTypeInput> {
  if (input.expiration_rule === "none" || input.expiration_rule === "fixed_date") {
    return { ...input, expiration_duration_months: null };
  }
  return input;
}

/**
 * Create a new prerequisite type in the catalog.
 */
export async function createPrerequisiteType(
  input: PrerequisiteTypeInput
): Promise<{ success: boolean; prerequisiteType?: PrerequisiteType; error?: string }> {
  try {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Name is required." };
    }

    const normalized = normalizeExpirationDuration(input);

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("prerequisite_types")
      .insert({
        name: trimmedName,
        input_type: normalized.input_type,
        description: normalized.description ?? null,
        required_by_default: normalized.required_by_default ?? true,
        expiration_rule: normalized.expiration_rule ?? "none",
        expiration_duration_months: normalized.expiration_duration_months ?? null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: mapPrerequisiteTypeError(error) };
    }

    return { success: true, prerequisiteType: data as PrerequisiteType };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to create prerequisite type" };
  }
}

/**
 * Update an existing prerequisite type in the catalog.
 */
export async function updatePrerequisiteType(
  id: string,
  input: Partial<PrerequisiteTypeInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = normalizeExpirationDuration(input);
    const updateData: Record<string, unknown> = {};

    if (normalized.name !== undefined) updateData.name = normalized.name.trim();
    if (normalized.input_type !== undefined) updateData.input_type = normalized.input_type;
    if (normalized.description !== undefined) updateData.description = normalized.description;
    if (normalized.required_by_default !== undefined) updateData.required_by_default = normalized.required_by_default;
    if (normalized.expiration_rule !== undefined) updateData.expiration_rule = normalized.expiration_rule;
    if (normalized.expiration_duration_months !== undefined) updateData.expiration_duration_months = normalized.expiration_duration_months;

    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from("prerequisite_types")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPrerequisiteTypeError(error) };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to update prerequisite type" };
  }
}

/**
 * Soft-delete (archive) a prerequisite type. Rows referenced by templates or
 * class snapshots are never hard-deleted.
 */
export async function archivePrerequisiteType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from("prerequisite_types")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to archive prerequisite type" };
  }
}

/**
 * Fetch the prerequisites assigned to a program or course template, joined
 * to their catalog type, ordered by sort_order.
 */
export async function getTemplatePrerequisites(
  courseUuid: string
): Promise<{ templatePrerequisites: TemplatePrerequisiteWithType[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("template_prerequisites")
      .select("*, prerequisite_type:prerequisite_types(*)")
      .eq("course_uuid", courseUuid)
      .order("sort_order", { ascending: true });

    if (error) {
      return { templatePrerequisites: null, error: error.message };
    }

    return { templatePrerequisites: data as unknown as TemplatePrerequisiteWithType[], error: null };
  } catch (err) {
    const error = err as Error;
    return { templatePrerequisites: null, error: error.message || "Failed to fetch template prerequisites" };
  }
}

/**
 * Assign a prerequisite type to a program or course template.
 */
export async function addTemplatePrerequisite(
  courseUuid: string,
  prerequisiteTypeId: string,
  isRequired: boolean,
  sortOrder: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("template_prerequisites").insert({
      course_uuid: courseUuid,
      prerequisite_type_id: prerequisiteTypeId,
      is_required: isRequired,
      sort_order: sortOrder,
    });

    if (error) {
      if ((error as any).code === "23505") {
        return { success: false, error: "That prerequisite is already assigned to this template." };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to assign prerequisite" };
  }
}

/**
 * Update an existing template prerequisite assignment (required flag and/or sort order).
 */
export async function updateTemplatePrerequisite(
  id: string,
  input: { is_required?: boolean; sort_order?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("template_prerequisites").update(input).eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to update prerequisite assignment" };
  }
}

/**
 * Remove a prerequisite assignment from a template. Safe because class
 * snapshots are independent copies (BEN-853).
 */
export async function removeTemplatePrerequisite(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("template_prerequisites").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to remove prerequisite assignment" };
  }
}

/**
 * Rewrite the sort_order of a full ordered list of template prerequisite ids.
 * Issues one update per id, sequentially, and returns the first failure if any.
 */
export async function reorderTemplatePrerequisites(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  for (let index = 0; index < orderedIds.length; index++) {
    const result = await updateTemplatePrerequisite(orderedIds[index], { sort_order: index });
    if (!result.success) {
      return result;
    }
  }
  return { success: true };
}

/**
 * Fetch the read-only prerequisite snapshot on a class, joined to its
 * catalog type, ordered by sort_order.
 */
export async function getClassPrerequisites(
  classId: string
): Promise<{ classPrerequisites: ClassPrerequisiteWithType[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("class_prerequisites")
      .select("*, prerequisite_type:prerequisite_types(*)")
      .eq("class_id", classId)
      .order("sort_order", { ascending: true });

    if (error) {
      return { classPrerequisites: null, error: error.message };
    }

    return { classPrerequisites: data as unknown as ClassPrerequisiteWithType[], error: null };
  } catch (err) {
    const error = err as Error;
    return { classPrerequisites: null, error: error.message || "Failed to fetch class prerequisites" };
  }
}
