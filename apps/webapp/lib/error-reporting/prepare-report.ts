import { computeFingerprint } from "./fingerprint";
import { scrubAndTruncate } from "./scrub";
import type { ClientErrorPayload, ScrubbedErrorReport } from "./types";
import { getDeploymentEnvironment } from "./config";

export function prepareErrorReport(
  payload: ClientErrorPayload
): ScrubbedErrorReport {
  const message = scrubAndTruncate(payload.message) ?? payload.message;
  const stack = scrubAndTruncate(payload.stack);
  const responseBody = scrubAndTruncate(payload.responseBody);

  const fingerprint = computeFingerprint({
    kind: payload.kind,
    message,
    stack,
    requestUrl: payload.requestUrl,
  });

  return {
    ...payload,
    message,
    stack,
    responseBody,
    fingerprint,
    environment: getDeploymentEnvironment(),
  };
}
