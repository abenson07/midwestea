import type { ClientErrorPayload, ErrorKind } from "./types";

const ERROR_KINDS: ErrorKind[] = ["uncaught", "unhandledrejection", "http"];

function isErrorKind(value: unknown): value is ErrorKind {
  return typeof value === "string" && ERROR_KINDS.includes(value as ErrorKind);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || typeof value === "number";
}

export function parseClientErrorPayload(body: unknown): ClientErrorPayload | null {
  if (!body || typeof body !== "object") return null;

  const payload = body as Record<string, unknown>;

  if (
    !isNonEmptyString(payload.pageUrl) ||
    !isNonEmptyString(payload.message) ||
    !isErrorKind(payload.kind) ||
    !isNonEmptyString(payload.timestamp)
  ) {
    return null;
  }

  if (!isOptionalString(payload.requestUrl)) return null;
  if (!isOptionalString(payload.method)) return null;
  if (!isOptionalString(payload.stack)) return null;
  if (!isOptionalString(payload.responseBody)) return null;
  if (!isOptionalNumber(payload.statusCode)) return null;

  if (payload.kind === "http") {
    if (
      typeof payload.statusCode !== "number" ||
      payload.statusCode < 400 ||
      payload.statusCode > 599
    ) {
      return null;
    }
  }

  return {
    pageUrl: payload.pageUrl.trim(),
    message: payload.message.trim(),
    kind: payload.kind,
    requestUrl: payload.requestUrl?.trim(),
    statusCode: payload.statusCode,
    method: payload.method?.trim(),
    stack: payload.stack,
    responseBody: payload.responseBody,
    timestamp: payload.timestamp.trim(),
  };
}
