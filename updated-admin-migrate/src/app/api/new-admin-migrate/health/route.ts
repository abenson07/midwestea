import { NextResponse } from "next/server";
import { createStagingAdminClient } from "@/lib/staging/adminClient";
import { requireStagingAdmin } from "@/lib/staging/auth";

export const runtime = "nodejs";

async function countRows(
  supabase: ReturnType<typeof createStagingAdminClient>,
  table: "students" | "enrollments" | "classes" | "transactions",
) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  return count ?? 0;
}

/**
 * GET /api/new-admin-migrate/health
 * Confirms the fork can reach staging. Returns counts only — no rows.
 */
export async function GET(request: Request) {
  const auth = await requireStagingAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const supabase = createStagingAdminClient();
    const [studentCount, enrollmentCount, classCount, transactionCount] = await Promise.all([
      countRows(supabase, "students"),
      countRows(supabase, "enrollments"),
      countRows(supabase, "classes"),
      countRows(supabase, "transactions"),
    ]);

    return NextResponse.json({
      ok: true,
      studentCount,
      enrollmentCount,
      classCount,
      transactionCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach staging";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
