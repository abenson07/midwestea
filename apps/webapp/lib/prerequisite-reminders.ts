"use client";

import { createSupabaseClient } from "@midwestea/utils";

/** Admin "Remind": emails the student about a missing prerequisite document. */
export async function sendPrerequisiteReminder(params: {
  studentId: string;
  classId: string;
  prerequisiteTypeId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return { ok: false, error: "Not authenticated" };

    const response = await fetch("/api/admin/prerequisites/remind", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      return { ok: false, error: result?.error || "Failed to send reminder" };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to send reminder" };
  }
}
