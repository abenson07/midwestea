"use client";

import { computeFingerprint } from "./fingerprint";
import { captureBrowserInfo } from "./capture-browser-info";
import type { ClientErrorPayload } from "./types";

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

export function reportClientError(payload: Omit<ClientErrorPayload, "timestamp" | "browserInfo">): void {
  const fullPayload: ClientErrorPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
    browserInfo: captureBrowserInfo(),
  };

  const fingerprint = computeFingerprint({
    kind: fullPayload.kind,
    message: fullPayload.message,
    stack: fullPayload.stack,
    requestUrl: fullPayload.requestUrl,
  });

  if (!shouldReport(fingerprint)) {
    return;
  }

  const body = JSON.stringify(fullPayload);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
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
