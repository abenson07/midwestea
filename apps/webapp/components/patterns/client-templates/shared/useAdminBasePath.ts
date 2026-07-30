"use client";

import { usePathname } from "next/navigation";

/**
 * Lets shared client-template components (cards, tables, side-navs) that
 * hardcode navigation targets stay correct in both `/admin-preview` (frozen
 * demo) and `/admin-migrate` (real-data build), without duplicating the
 * component just to change a route prefix.
 */
export function useAdminBasePath(): "/admin-migrate" | "/admin-preview" {
  const pathname = usePathname();
  return pathname?.startsWith("/admin-migrate") ? "/admin-migrate" : "/admin-preview";
}
