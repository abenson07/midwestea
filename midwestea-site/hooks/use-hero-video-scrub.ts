"use client";

import { useEffect, type RefObject } from "react";
import { ensureGsapScrollTrigger, gsap, ScrollTrigger } from "@/lib/gsap";

export function useHeroVideoScrub(
  trackRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  useEffect(() => {
    ensureGsapScrollTrigger();

    const track = trackRef.current;
    const videoEl = videoRef.current;
    if (!track || !videoEl) return;

    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.pause();
    videoEl.currentTime = 0;

    let armed = false;
    let targetTime = 0;
    let currentTime = 0;

    const arm = () => {
      armed = true;
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("keydown", arm);
    };

    window.addEventListener("wheel", arm, { passive: true });
    window.addEventListener("touchstart", arm, { passive: true });
    window.addEventListener("keydown", arm);

    const tick = () => {
      if (!armed) return;
      currentTime += (targetTime - currentTime) * 0.12;
      if (Math.abs(videoEl.currentTime - currentTime) > 0.015) {
        videoEl.currentTime = currentTime;
      }
    };

    gsap.ticker.add(tick);

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top+=1",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        if (!armed || !videoEl.duration) return;
        targetTime = self.progress * (videoEl.duration - 0.001);
      },
      invalidateOnRefresh: true,
    });

    const refresh = () => ScrollTrigger.refresh();
    videoEl.addEventListener("loadedmetadata", refresh);
    window.addEventListener("load", refresh);

    return () => {
      cleanupListeners();
      gsap.ticker.remove(tick);
      trigger.kill();
      videoEl.removeEventListener("loadedmetadata", refresh);
      window.removeEventListener("load", refresh);
    };
  }, [trackRef, videoRef]);
}
