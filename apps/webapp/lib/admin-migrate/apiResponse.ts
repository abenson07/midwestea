import { NextResponse } from "next/server";

export function stagingOk<T extends Record<string, unknown>>(body: T) {
  return NextResponse.json({ ok: true, ...body });
}

export function stagingError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : fallback;
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
