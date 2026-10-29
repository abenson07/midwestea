"use client";

import { createSupabaseClient } from "@midwestea/utils";

export type AdminMessageTarget = { studentId: string } | { classId: string };

export interface AdminMessageResponse {
  sent: number;
  failed: Array<{ studentId: string; error: string }>;
  recipients: number;
  recipientNames?: string[];
}

/**
 * Call POST /api/admin/messages with the admin session Bearer token.
 * Throws an Error with the server's message on any non-2xx response.
 */
export async function postAdminMessage(
  target: AdminMessageTarget,
  subject: string,
  message: string,
  options?: { dryRun?: boolean; expectedRecipients?: number }
): Promise<AdminMessageResponse> {
  const supabase = await createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...target, subject, message, ...options }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || "Failed to send message");
  return result as AdminMessageResponse;
}
