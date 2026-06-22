"use client";

import { ensureGsapScrollTrigger, ScrollTrigger } from "@/lib/marketing/gsap";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function MarketingScrollInit() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    ensureGsapScrollTrigger();
    ScrollTrigger.clearScrollMemory("manual");

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
