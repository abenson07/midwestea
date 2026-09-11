"use client";

const STORAGE_KEY = "mea_utm_attribution";

export type UtmAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/**
 * First-touch UTM capture: if the current URL carries utm_* params and none
 * are stored yet this session, save them. Later visits (no params, or a
 * second campaign link) never overwrite the first touch.
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") ?? undefined;
    const utmMedium = params.get("utm_medium") ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? undefined;

    if (!utmSource && !utmMedium && !utmCampaign) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ utmSource, utmMedium, utmCampaign }));
  } catch {
    // Storage unavailable (private mode, etc.) — attribution is best-effort.
  }
}

export function getStoredUtmParams(): UtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmAttribution) : {};
  } catch {
    return {};
  }
}
