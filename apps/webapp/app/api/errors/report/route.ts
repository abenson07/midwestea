import { NextRequest, NextResponse } from "next/server";
import { getLinearErrorReportingConfig } from "@/lib/error-reporting/config";
import { prepareErrorReport } from "@/lib/error-reporting/prepare-report";
import { isRateLimited } from "@/lib/error-reporting/rate-limit";
import { parseClientErrorPayload } from "@/lib/error-reporting/validate";
import { createLinearErrorIssue } from "@/lib/linear/create-error-issue";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getLinearErrorReportingConfig();
  if (!config) {
    return new NextResponse(null, { status: 204 });
  }

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

  try {
    const issue = await createLinearErrorIssue(config, report);
    return NextResponse.json({ ok: true, issueId: issue.issueId, issueIdentifier: issue.issueIdentifier });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Linear issue";
    console.error("[errors/report] Linear issue creation failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
