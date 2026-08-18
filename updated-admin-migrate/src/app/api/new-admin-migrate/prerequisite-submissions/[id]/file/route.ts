import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/prerequisite-submissions/[id]/file
 *
 * Fronts prerequisite file downloads so an expired signed storage URL never
 * surfaces a raw storage error to the admin. No real submission storage is
 * wired up yet, so this always redirects to the same demo file — this route
 * is the seam where a fresh signed URL gets minted once it is.
 */
export async function GET(
  request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  return NextResponse.redirect(new URL("/documents/spencer-nash-certificate.pdf", request.url));
}
