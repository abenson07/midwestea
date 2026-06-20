import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@midwestea/utils";

/**
 * Vercel cron: inserts a daily log row to keep the Supabase database active.
 * Protected by CRON_SECRET (Vercel sends Authorization: Bearer <CRON_SECRET>).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expected = `Bearer ${cronSecret}`;
    if (authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createSupabaseAdminClient();
    const message = "standard chron job to keep db active";

    const { data, error } = await supabase
      .from("logs")
      .insert([{ message, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error("Cron daily-log insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      createdAt: data.created_at,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron daily-log error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
