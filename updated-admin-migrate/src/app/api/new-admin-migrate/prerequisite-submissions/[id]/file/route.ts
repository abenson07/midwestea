import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/prerequisite-submissions/[id]/file
 *
 * Deliberately NOT bearer-gated like the other new-admin-migrate routes —
 * this is loaded via `<iframe src>` in ClassPrerequisiteViewer, and browsers
 * don't attach custom headers (including Authorization) to iframe
 * navigation, so a bearer-token check here would just 401 the viewer.
 *
 * Safe for now because it redirects to a public static demo asset, not real
 * student data — no real submission storage is wired up yet. When it is,
 * follow apps/webapp's existing pattern for this exact problem
 * (app/api/prerequisites/credentials/[id]/view/route.ts): a separate
 * fetch()-based, bearer-gated route mints a short-lived Supabase Storage
 * signed URL after checking admin, and only that already-authorized URL
 * gets passed to a same-origin, auth-free proxy route (restricted to
 * trusted storage hostnames/paths) for the iframe to actually load. Do not
 * just re-add requireStagingAdmin here — it won't work for this route.
 */
export async function GET(
  request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  return NextResponse.redirect(new URL("/documents/spencer-nash-certificate.pdf", request.url));
}
