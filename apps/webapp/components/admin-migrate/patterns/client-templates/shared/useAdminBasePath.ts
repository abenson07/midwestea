"use client";

import { usePathname } from "next/navigation";

export type AdminBasePath = "/admin" | "/admin-preview" | "/new-admin-migrate";

/**
 * Lets shared client-template components (cards, tables, side-navs) that
 * hardcode navigation targets stay correct in `/admin-preview` (frozen
 * demo), `/new-admin-migrate` (migration fork), and `/admin` (real-data
 * build), without duplicating the component just to change a route prefix.
 */
export function useAdminBasePath(): AdminBasePath {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin-preview")) return "/admin-preview";
  if (pathname?.startsWith("/new-admin-migrate")) return "/new-admin-migrate";
  return "/admin";
}

/**
 * True whenever real staging/production data should be used instead of
 * fixtures — i.e. everywhere except the frozen `/admin-preview` demo.
 * Deliberately `!== "/admin-preview"` rather than `=== "/new-admin-migrate"`:
 * this needs to stay true once the real-data build lands at its final
 * `/admin` home too, not just during the `/new-admin-migrate` staging step.
 */
export function useIsNewAdminMigrate(): boolean {
  return useAdminBasePath() !== "/admin-preview";
}
