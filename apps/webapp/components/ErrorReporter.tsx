"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/error-reporting/report-client-error";
import type { ClientErrorPayload } from "@/lib/error-reporting/types";

const REPORT_ENDPOINT = "/api/errors/report";

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

function reportError(payload: Omit<ClientErrorPayload, "timestamp">): void {
  reportClientError(payload);
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

function getThirdPartyScriptHosts(): string[] {
  const hosts = new Set<string>();
  for (const script of Array.from(document.scripts)) {
    if (!script.src) continue;
    try {
      const url = new URL(script.src);
      if (url.origin !== window.location.origin) hosts.add(url.host);
    } catch {
      // ignore malformed src
    }
  }
  return Array.from(hosts).slice(0, 10);
}

/**
 * Browsers hide the details of errors thrown by cross-origin scripts (analytics,
 * Stripe, etc.) and report only "Script error." with no stack, file or line. When
 * we do have a file/line (same-origin errors with no Error object) keep it; when
 * the error is opaque, record which third-party script hosts were on the page so
 * the report can still be traced to a likely source.
 */
function getUncaughtErrorStack(event: ErrorEvent): string | undefined {
  if (event.error instanceof Error && event.error.stack) {
    return event.error.stack;
  }

  if (event.filename) {
    return `at ${event.filename}:${event.lineno}:${event.colno}`;
  }

  if (!event.message || /^script error\.?$/i.test(event.message.trim())) {
    const hosts = getThirdPartyScriptHosts();
    return `Opaque cross-origin script error (browser hid details). Third-party script hosts on page: ${hosts.length ? hosts.join(", ") : "none found"}`;
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
        stack: getUncaughtErrorStack(event),
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
