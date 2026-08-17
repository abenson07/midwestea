import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Stubbed for the portable demo export: this bundle has no backend, so
 * every hook that checks `if (!supabaseClient)` falls back to its demo path.
 * Typed (not `any`) so those call sites still type-check normally.
 */
export const supabaseClient = null as SupabaseClient | null;
