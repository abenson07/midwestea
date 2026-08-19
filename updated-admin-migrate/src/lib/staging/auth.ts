import { NextResponse } from "next/server";
import { createStagingAdminClient } from "./adminClient";

/**
 * Ported from apps/webapp/lib/logging.ts's getCurrentAdmin(). Same table,
 * same shape, same staging Supabase project — kept as a straight port
 * rather than a shared import since this app has its own package.json and
 * can't reach across into apps/webapp's module graph.
 */
export async function getCurrentAdmin(
  userId: string,
): Promise<{ admin: { id: string; display_name: string } | null; error: string | null }> {
  const supabase = createStagingAdminClient();
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, display_name")
    .eq("id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { admin: null, error: error.message };
  }

  return { admin, error: null };
}

type AdminAuthResult =
  | { ok: true; admin: { id: string; display_name: string } }
  | { ok: false; response: NextResponse };

/**
 * Bearer-token admin check for the new admin's API routes, mirroring the
 * pattern apps/webapp's routes use (see PR #15 / fix/admin-auth-gap):
 * verify the token, then confirm the user is a non-deleted row in `admins`.
 * Centralized here instead of repeated inline in each route, since this
 * exact check needs to land correctly in all ~12 of them.
 */
export async function requireStagingAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Unauthorized - Missing or invalid authorization header" },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.slice("Bearer ".length);
  const supabase = createStagingAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Unauthorized - Invalid session" },
        { status: 401 },
      ),
    };
  }

  const { admin, error: adminError } = await getCurrentAdmin(user.id);
  if (adminError || !admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, admin };
}
