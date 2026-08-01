"use client";

import { createSupabaseClient } from "@midwestea/utils";
import type { PrerequisiteInputType, PrerequisiteType } from "@midwestea/types";

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

/**
 * Create a new prerequisite type in the catalog.
 */
export async function createPrerequisiteType(
  name: string,
  inputType: PrerequisiteInputType
): Promise<{ success: boolean; prerequisiteType?: PrerequisiteType; error?: string }> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: "Name is required." };
    }

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("prerequisite_types")
      .insert({
        name: trimmedName,
        input_type: inputType,
      })
      .select()
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return { success: false, error: "A prerequisite with this name and input type already exists." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, prerequisiteType: data as PrerequisiteType };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to create prerequisite type" };
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
