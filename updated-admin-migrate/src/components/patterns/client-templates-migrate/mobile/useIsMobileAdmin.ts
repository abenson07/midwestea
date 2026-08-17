"use client";

import { useEffect, useState } from "react";

const QUERY = "(max-width: 767px)";

/**
 * True below the admin-migrate mobile breakpoint (phone-width).
 * SSR / first paint defaults to false so desktop demos don't flash mobile UI.
 */
export function useIsMobileAdmin(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
