import { NextResponse } from "next/server";
import { createStagingAdminClient } from "@/lib/staging/adminClient";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/health
 * Confirms the fork can reach staging. Returns a student count only — no rows.
 */
export async function GET() {
  try {
    const supabase = createStagingAdminClient();
    const { count, error } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, studentCount: count ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach staging";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
