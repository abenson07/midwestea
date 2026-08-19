"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

export type CurrentAdmin = { id: string; display_name: string };

/**
 * Fetches the logged-in admin's own record via the same /api/admin/me
 * AdminShell already checks against — reused here so the sidebar can show
 * the real admin's name instead of a hardcoded placeholder.
 */
export function useCurrentAdmin(): { admin: CurrentAdmin | null; loading: boolean } {
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { session } = await getSession();
      if (!session?.access_token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setAdmin(data.admin ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { admin, loading };
}
