import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@midwestea/utils";
import { getCurrentAdmin } from "@/lib/logging";
import { listClasses } from "@/lib/admin-migrate/classes";

export const runtime = "nodejs";

/**
 * GET /api/admin/classes
 * Class labels from staging (service role) — for internal admin tooling
 * (e.g. the command palette), not the class-catalog UI.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createSupabaseAdminClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { admin, error: adminError } = await getCurrentAdmin(user.id);
    if (adminError || !admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const classes = await listClasses();
    return NextResponse.json({ classes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list classes";
    console.error("[admin/classes] Unexpected error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
