"use client";

import { useEffect, useRef } from "react";
import { ensureGsapScrollTrigger, gsap, ScrollTrigger } from "@/lib/marketing/gsap";

const HERO_SELECTOR = "[data-program-hero], [data-course-hero]";
const FOOTER_SELECTOR = '[data-scroll="footer"]';

export function useEnrollmentBarScroll(enabled = true) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    ensureGsapScrollTrigger();

    const bar = barRef.current;
    if (!bar) return;

    const hero = document.querySelector(HERO_SELECTOR);
    gsap.set(bar, { y: "100%" });

    const cleanups: (() => void)[] = [];

    if (!hero) {
      gsap.set(bar, { y: "0%" });
    } else {
      const heroTween = gsap.to(bar, {
        y: "0%",
        ease: "power2.out",
        duration: 0.4,
        scrollTrigger: {
          trigger: hero,
          start: "bottom top",
          toggleActions: "play none none reverse",
        },
      });

      cleanups.push(() => {
        heroTween.scrollTrigger?.kill();
        heroTween.kill();
      });
    }

    const footer = document.querySelector(FOOTER_SELECTOR);
    if (footer) {
      const footerTimeline = gsap.timeline({ paused: true });
      footerTimeline.to(bar, {
        y: "100%",
        ease: "power2.inOut",
        duration: 0.35,
      });

      const footerTrigger = ScrollTrigger.create({
        trigger: footer,
        start: "top bottom",
        end: "bottom bottom",
        onEnter: () => footerTimeline.play(),
        onLeaveBack: () => footerTimeline.reverse(),
      });

      cleanups.push(() => {
        footerTrigger.kill();
        footerTimeline.kill();
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      gsap.set(bar, { clearProps: "transform" });
    };
  }, [enabled]);

  return barRef;
}
