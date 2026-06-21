import type { ErrorKind } from "./types";

export function normalizeMessage(message: string): string {
  return message
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "<uuid>"
    )
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "<email>")
    .replace(/\d+/g, "<n>");
}

export function topStackFrame(stack?: string): string {
  if (!stack) return "";
  const lines = stack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[1] ?? lines[0] ?? "";
}

export function requestPathname(requestUrl?: string): string {
  if (!requestUrl) return "";
  try {
    return new URL(requestUrl, "http://localhost").pathname;
  } catch {
    return requestUrl.split("?")[0] ?? "";
  }
}

export function computeFingerprint(input: {
  kind: ErrorKind;
  message: string;
  stack?: string;
  requestUrl?: string;
}): string {
  const parts = [
    input.kind,
    normalizeMessage(input.message),
    topStackFrame(input.stack),
    requestPathname(input.requestUrl),
  ].join("|");

  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash << 5) - hash + parts.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0");
}
