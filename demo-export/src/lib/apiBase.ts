/**
 * Base path for API when deployed behind a mount path (Webflow Cloud).
 * On Vercel / local, leave NEXT_PUBLIC_BASE_PATH unset — APIs live at `/api/*`.
 *
 * If the env var is missing at runtime, infer `/dashboard` from the page URL so
 * client fetches hit the worker instead of the marketing site root (HTML 404).
 */
export function getApiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path === "/dashboard" || path.startsWith("/dashboard/")) {
      return "/dashboard";
    }
  }

  return "";
}
