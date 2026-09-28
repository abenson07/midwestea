import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXPIRED_LINK_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Link expired</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f9fafb; color: #111827; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
      .card { max-width: 420px; text-align: center; }
      h1 { font-size: 18px; margin-bottom: 12px; }
      p { font-size: 14px; line-height: 1.5; color: #4b5563; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This link has expired</h1>
      <p>File links are only valid for a few minutes to protect the student's privacy. Go back into the admin panel and click &ldquo;View file&rdquo; again to get a new one.</p>
    </div>
  </body>
</html>`;

function expiredResponse(status: number = 400) {
  return new NextResponse(EXPIRED_LINK_HTML, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Only allow this route to stream from our own Supabase Storage signed-URL
 * host/path shape — never an arbitrary caller-supplied URL. Prevents this
 * route being turned into an open fetch proxy.
 */
function isTrustedStorageUrl(src: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!base) return false;
  try {
    const srcUrl = new URL(src);
    const baseUrl = new URL(base);
    return srcUrl.hostname === baseUrl.hostname && srcUrl.pathname.startsWith('/storage/v1/object/sign/');
  } catch {
    return false;
  }
}

/**
 * GET /api/prerequisites/credentials/[id]/view?src=<already-minted signed URL>
 *
 * Direct-navigation file viewer (opened via window.open, not fetch). The
 * signed URL itself is minted exactly as before, by the authenticated
 * /file route — this route never mints anything and never sees a Bearer
 * token, it only streams whatever /file already authorized.
 *
 * The point: every open (including a stale tab's reload) hits our own
 * origin, so a signed URL that has expired since it was minted surfaces our
 * own friendly page instead of Supabase Storage's raw InvalidJWT error.
 */
export async function GET(request: NextRequest) {
  try {
    const src = request.nextUrl.searchParams.get('src');
    if (!src || !isTrustedStorageUrl(src)) {
      return expiredResponse(400);
    }

    const fileResponse = await fetch(src);
    if (!fileResponse.ok) {
      // Covers the expired-signed-URL case (400 InvalidJWT) and any other
      // storage-side failure the same way — the visitor doesn't need to
      // know which, just that they need a fresh link.
      return expiredResponse(400);
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
      },
    });
  } catch (error: any) {
    console.error('[API] Error in credential view route:', error);
    return expiredResponse(500);
  }
}
