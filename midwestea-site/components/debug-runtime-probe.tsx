"use client";

import { useEffect } from "react";

function sendDebugLog(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
  // #region agent log
  fetch("http://127.0.0.1:7574/ingest/c1f5fbc6-11ce-4d3f-a000-61b663cad204", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "0e1951",
    },
    body: JSON.stringify({
      sessionId: "0e1951",
      runId: "post-fix",
      hypothesisId,
      location: "components/debug-runtime-probe.tsx",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function DebugRuntimeProbe() {
  useEffect(() => {
    sendDebugLog(
      "client-probe-mounted",
      {
        href: window.location.href,
        port: window.location.port || "default",
      },
      "C",
    );

    const onError = (event: ErrorEvent) => {
      sendDebugLog(
        "window-error",
        {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          href: window.location.href,
        },
        "C",
      );
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      sendDebugLog(
        "unhandled-rejection",
        {
          reason:
            event.reason instanceof Error
              ? event.reason.message
              : String(event.reason),
          href: window.location.href,
        },
        "C",
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
