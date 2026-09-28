"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

/**
 * The logged-in admin's email, straight from the Supabase auth session —
 * /api/admin/me only returns { id, display_name }, no email.
 */
export function useCurrentAdminEmail(): { email: string | null; loading: boolean } {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { session } = await getSession();
      if (!cancelled) {
        setEmail(session?.user?.email ?? null);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { email, loading };
}
