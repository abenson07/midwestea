import { NextRequest, NextResponse } from "next/server";
import { renderCompletionCertificatePdf } from "@/lib/certificates/render";
import type { CompletionCertificateProps } from "@/lib/certificates/types";

export const runtime = "nodejs";

/** POST CompletionCertificateProps -> PDF bytes. Dev-only preview tool; renders server-side (child process). */
export async function POST(request: NextRequest) {
  const props = (await request.json()) as CompletionCertificateProps;

  try {
    const blob = await renderCompletionCertificatePdf(props);
    const buffer = Buffer.from(await blob.arrayBuffer());
    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to render PDF" }, { status: 500 });
  }
}
