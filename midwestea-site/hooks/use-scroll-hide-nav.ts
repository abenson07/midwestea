"use client";

import { useEffect, useRef } from "react";

export function useScrollHideNav(enabled = true) {
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    if (!enabled) {
      nav.style.transform = "translateY(0)";
      return;
    }

    const onScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY.current) {
        nav.style.transform = "translateY(-100%)";
      } else {
        nav.style.transform = "translateY(0)";
      }
      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return navRef;
}
