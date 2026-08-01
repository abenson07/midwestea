"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type {
  PrerequisiteExpirationRule,
  PrerequisiteInputType,
  PrerequisiteType,
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
