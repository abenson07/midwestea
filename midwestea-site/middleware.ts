import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
      location: "middleware.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "unknown";
  const search = request.nextUrl.search;

  if (pathname === "/policies" || pathname === "/policy") {
    sendDebugLog(
      "policies-route-request",
      { pathname, host, search },
      "A",
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/policies", "/policy"],
};
