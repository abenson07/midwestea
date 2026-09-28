import { computeFingerprint } from "./fingerprint";
import { scrubAndTruncate } from "./scrub";
import { getDeploymentEnvironment } from "./config";
import { logErrorReport } from "./log-to-supabase";

export interface ServerErrorInput {
  message: string;
  stack?: string;
  requestUrl?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Log a server-side/API route error to error_logs. Call from a route's
 * catch block for failures that represent real bugs (not expected
 * validation 4xxs). Never throws.
 */
export async function logServerError(input: ServerErrorInput): Promise<void> {
  const message = scrubAndTruncate(input.message) ?? input.message;
  const stack = scrubAndTruncate(input.stack);

  const fingerprint = computeFingerprint({
    kind: "http",
    message,
    stack,
    requestUrl: input.requestUrl,
  });

  await logErrorReport({
    source: "server",
    kind: "server",
    message,
    stack,
    pageUrl: input.requestUrl ?? "server",
    requestUrl: input.requestUrl,
    statusCode: input.statusCode,
    timestamp: new Date().toISOString(),
    fingerprint,
    environment: getDeploymentEnvironment(),
    context: input.context,
  });
}
