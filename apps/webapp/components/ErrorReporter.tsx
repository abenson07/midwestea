"use client";

import { useEffect } from "react";
import { computeFingerprint } from "@/lib/error-reporting/fingerprint";
import type { ClientErrorPayload } from "@/lib/error-reporting/types";

const REPORT_ENDPOINT = "/api/errors/report";
const DEDUPE_WINDOW_MS = 60_000;

const recentFingerprints = new Map<string, number>();

function shouldReport(fingerprint: string): boolean {
  const now = Date.now();
  const lastReported = recentFingerprints.get(fingerprint);
  if (lastReported && now - lastReported < DEDUPE_WINDOW_MS) {
    return false;
  }

  recentFingerprints.set(fingerprint, now);
  return true;
}

function isReportEndpoint(url: string): boolean {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return pathname === REPORT_ENDPOINT;
  } catch {
    return url.includes(REPORT_ENDPOINT);
  }
}

async function readResponseBody(response: Response): Promise<string | undefined> {
  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("application/json") &&
    !contentType.includes("text/")
  ) {
    return undefined;
  }

  try {
    const text = await response.clone().text();
    return text.slice(0, 2000);
  } catch {
    return undefined;
  }
}

function sendReport(payload: ClientErrorPayload): void {
  const fingerprint = computeFingerprint({
    kind: payload.kind,
    message: payload.message,
    stack: payload.stack,
    requestUrl: payload.requestUrl,
  });

  if (!shouldReport(fingerprint)) {
    return;
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(REPORT_ENDPOINT, blob)) {
      return;
    }
  }

  void fetch(REPORT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Reporting failures must not affect the app.
  });
}

function reportError(payload: Omit<ClientErrorPayload, "timestamp">): void {
  sendReport({
    ...payload,
    timestamp: new Date().toISOString(),
  });
}

function getErrorMessage(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message || reason.name || "Unhandled promise rejection";
  }

  if (typeof reason === "string") {
    return reason;
  }

  try {
    return JSON.stringify(reason);
  } catch {
    return "Unhandled promise rejection";
  }
}

function getErrorStack(reason: unknown): string | undefined {
  if (reason instanceof Error) {
    return reason.stack;
  }

  return undefined;
}

export function ErrorReporter() {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      reportError({
        pageUrl: window.location.href,
        kind: "uncaught",
        message: event.message || "Uncaught error",
        stack: event.error instanceof Error ? event.error.stack : undefined,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError({
        pageUrl: window.location.href,
        kind: "unhandledrejection",
        message: getErrorMessage(event.reason),
        stack: getErrorStack(event.reason),
      });
    };

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.ok || response.status < 400 || response.status > 599) {
        return response;
      }

      const input = args[0];
      const init = args[1];
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (isReportEndpoint(requestUrl)) {
        return response;
      }

      const method =
        init?.method ??
        (typeof input !== "string" && !(input instanceof URL)
          ? input.method
          : "GET");

      const responseBody = await readResponseBody(response);
      let message = `HTTP ${response.status}`;

      if (responseBody) {
        try {
          const parsed = JSON.parse(responseBody) as { error?: string; message?: string };
          message = parsed.error ?? parsed.message ?? message;
        } catch {
          message = responseBody.slice(0, 200) || message;
        }
      }

      reportError({
        pageUrl: window.location.href,
        kind: "http",
        message,
        requestUrl,
        statusCode: response.status,
        method: method.toUpperCase(),
        responseBody,
      });

      return response;
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
