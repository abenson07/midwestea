import { createSupabaseAdminClient } from "@midwestea/utils";
import type { BrowserInfo } from "./types";

export type ErrorLogSource = "client" | "server";

export interface ErrorLogEntry {
  source: ErrorLogSource;
  kind: string;
  message: string;
  stack?: string;
  pageUrl?: string;
  requestUrl?: string;
  method?: string;
  statusCode?: number;
  responseBody?: string;
  fingerprint: string;
  environment: string;
  timestamp: string;
  context?: Record<string, unknown>;
  title?: string;
  reportedByAdminId?: string;
  reportedByName?: string;
  reportedByEmail?: string;
  browserInfo?: BrowserInfo;
}

/**
 * Insert an error report into the error_logs table for bulk triage.
 * Never throws — a logging failure must not affect the caller.
 */
export async function logErrorReport(entry: ErrorLogEntry): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("error_logs").insert({
      source: entry.source,
      kind: entry.kind,
      message: entry.message,
      stack: entry.stack ?? null,
      page_url: entry.pageUrl ?? null,
      request_url: entry.requestUrl ?? null,
      method: entry.method ?? null,
      status_code: entry.statusCode ?? null,
      response_body: entry.responseBody ?? null,
      fingerprint: entry.fingerprint,
      environment: entry.environment,
      context: entry.context ?? null,
      created_at: entry.timestamp,
      title: entry.title ?? null,
      reported_by_admin_id: entry.reportedByAdminId ?? null,
      reported_by_name: entry.reportedByName ?? null,
      reported_by_email: entry.reportedByEmail ?? null,
      browser_info: entry.browserInfo ?? null,
    });

    if (error) {
      console.error("[error-reporting] Supabase insert failed:", error.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[error-reporting] Supabase insert threw:", message);
  }
}
