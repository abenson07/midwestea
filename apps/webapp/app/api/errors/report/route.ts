import { NextRequest, NextResponse } from "next/server";
import { getLinearErrorReportingConfig } from "@/lib/error-reporting/config";
import { prepareErrorReport } from "@/lib/error-reporting/prepare-report";
import { isRateLimited } from "@/lib/error-reporting/rate-limit";
import { parseClientErrorPayload } from "@/lib/error-reporting/validate";
import { createLinearErrorIssue } from "@/lib/linear/create-error-issue";
import { logErrorReport } from "@/lib/error-reporting/log-to-supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseClientErrorPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid error payload" }, { status: 400 });
  }

  const report = prepareErrorReport(payload);

  if (isRateLimited(report.fingerprint)) {
    return NextResponse.json({ ok: true, skipped: "rate_limited" });
  }

  // Supabase is the durable source of truth for triage; it must not be
  // gated on Linear being configured, and a Linear failure must not stop it.
  await logErrorReport({ ...report, source: "client" });

  const config = getLinearErrorReportingConfig();
  if (!config) {
    return NextResponse.json({ ok: true });
  }

  try {
    const issue = await createLinearErrorIssue(config, report);
    return NextResponse.json({ ok: true, issueId: issue.issueId, issueIdentifier: issue.issueIdentifier });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Linear issue";
    console.error("[errors/report] Linear issue creation failed:", message);
    return NextResponse.json({ ok: true, linearError: message });
  }
}
