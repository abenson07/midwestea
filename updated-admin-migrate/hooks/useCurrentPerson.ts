"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export type CurrentPerson = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

/**
 * Resolves the logged-in dashboard user to their `people` row by email
 * (there's no auth_user_id column on `people`). Plain state, not react-query,
 * so it's safe to call from components that render outside a QueryClientProvider.
 */
export function useCurrentPerson() {
  const [person, setPerson] = useState<CurrentPerson | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!supabaseClient) {
      setPerson(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user?.email) {
      setPerson(null);
      setLoading(false);
      return;
    }
    const { data } = await supabaseClient
      .from("people")
      .select("id, full_name, email, phone")
      .eq("email", user.email)
      .maybeSingle();
    setPerson(data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void refetch();
  }, [refetch]);

  return { person, loading, refetch };
}
