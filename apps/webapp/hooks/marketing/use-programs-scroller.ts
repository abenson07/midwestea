"use client";

import { useEffect, type RefObject } from "react";
import { ensureGsapScrollTrigger, gsap, ScrollTrigger } from "@/lib/marketing/gsap";

function getMedia(panel: HTMLElement): HTMLElement | null {
  return (
    panel.querySelector<HTMLElement>(".panel-media") ??
    panel.querySelector<HTMLElement>(".program_media") ??
    panel.querySelector<HTMLElement>(".program-media")
  );
}

export function useProgramsScroller(
  scrollerRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLElement | null>,
  panelRefs: RefObject<(HTMLElement | null)[]>,
) {
  useEffect(() => {
    ensureGsapScrollTrigger();

    const scroller = scrollerRef.current;
    const viewport = viewportRef.current;
    const panels = (panelRefs.current ?? []).filter(Boolean) as HTMLElement[];

    if (!scroller || !viewport || panels.length < 1) return;

    function stackPanels() {
      const vh = window.innerHeight;
      viewport!.style.position = "relative";
      viewport!.style.height = `${vh}px`;
      viewport!.style.overflow = "hidden";

      panels.forEach((panel, i) => {
        panel.style.position = "absolute";
        panel.style.inset = "0";
        panel.style.zIndex = String(100 + i);

        const media = getMedia(panel);
        if (media) {
          media.style.position = "absolute";
          media.style.inset = "0";
          media.style.objectFit = "cover";
        }
      });
    }

    stackPanels();

    gsap.set(viewport, { scale: 0.95, transformOrigin: "50% 50%" });
    gsap.set(panels[0], { clipPath: "inset(0% 0% 0% 0%)" });
    panels.slice(1).forEach((panel) => {
      gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
    });

    const scaleTrigger = ScrollTrigger.create({
      trigger: viewport,
      start: "top 50%",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const t = self.progress;
        gsap.to(viewport, {
          scale: 0.95 + 0.05 * t,
          overwrite: true,
          ease: "none",
          duration: 0,
        });
      },
    });

    const tl = gsap.timeline({ paused: true });

    panels.forEach((panel) => {
      const media = getMedia(panel);
      if (media) gsap.set(media, { scale: 1 });
    });

    for (let i = 0; i < panels.length - 1; i++) {
      const next = panels[i + 1];
      tl.fromTo(
        next,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
        i,
      );
    }

    const pinTrigger = ScrollTrigger.create({
      trigger: scroller,
      start: "top top",
      end: () => `+=${(panels.length - 1) * window.innerHeight}`,
      pin: viewport,
      anticipatePin: 1,
      scrub: true,
      onUpdate: (self) => {
        tl.progress(self.progress);
      },
      onRefresh: () => stackPanels(),
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scaleTrigger.kill();
      pinTrigger.kill();
      tl.kill();
    };
  }, [scrollerRef, viewportRef, panelRefs]);
}
