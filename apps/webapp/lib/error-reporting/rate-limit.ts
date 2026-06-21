const WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 10;

const recentReports = new Map<string, number[]>();

export function isRateLimited(fingerprint: string): boolean {
  const now = Date.now();
  const timestamps = recentReports.get(fingerprint) ?? [];
  const activeTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (activeTimestamps.length >= MAX_REPORTS_PER_WINDOW) {
    recentReports.set(fingerprint, activeTimestamps);
    return true;
  }

  activeTimestamps.push(now);
  recentReports.set(fingerprint, activeTimestamps);
  return false;
}
