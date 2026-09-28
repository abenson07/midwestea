"use client";

import type { BrowserInfo } from "./types";

export function captureBrowserInfo(): BrowserInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screenResolution: `${window.screen?.width}x${window.screen?.height}`,
    referrer: document.referrer || undefined,
    devicePixelRatio: window.devicePixelRatio,
    online: navigator.onLine,
  };
}
