import { supabaseClient } from "@/lib/supabaseClient";

/**
 * Resolves the logged-in dashboard user to a `people` row by matching email.
 * There's no auth_user_id column on `people`, so email is the only join key.
 */
export async function getCurrentPersonId(): Promise<string | null> {
  if (!supabaseClient) return null;
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabaseClient
    .from("people")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  return data?.id ?? null;
}
