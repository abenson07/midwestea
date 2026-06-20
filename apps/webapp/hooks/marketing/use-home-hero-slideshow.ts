"use client";

import { useEffect, useRef } from "react";
import { ensureSlideshowEase, gsap, Observer } from "@/lib/marketing/gsap";

const ANIMATION_DURATION = 0.9;

export function useHomeHeroSlideshow() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    ensureSlideshowEase();

    const ui = {
      slides: Array.from(el.querySelectorAll<HTMLElement>('[data-slideshow="slide"]')),
      inner: Array.from(el.querySelectorAll<HTMLElement>('[data-slideshow="parallax"]')),
      thumbs: Array.from(el.querySelectorAll<HTMLElement>('[data-slideshow="thumb"]')),
      hotLeft: el.querySelector<HTMLElement>('[data-slideshow="hot-left"]'),
      hotRight: el.querySelector<HTMLElement>('[data-slideshow="hot-right"]'),
    };

    let current = 0;
    const length = ui.slides.length;
    if (length === 0) return;

    let animating = false;
    let observer: Observer | undefined;

    ui.slides.forEach((slide, index) => slide.setAttribute("data-index", String(index)));
    ui.thumbs.forEach((thumb, index) => thumb.setAttribute("data-index", String(index)));

    ui.slides[current]?.classList.add("is--current");
    ui.thumbs[current]?.classList.add("is--current");

    function navigate(direction: 1 | -1, targetIndex: number | null = null) {
      if (animating) return;
      animating = true;
      observer?.disable();

      const previous = current;
      current =
        targetIndex ??
        (direction === 1
          ? current < length - 1
            ? current + 1
            : 0
          : current > 0
            ? current - 1
            : length - 1);

      const currentSlide = ui.slides[previous];
      const currentInner = ui.inner[previous];
      const upcomingSlide = ui.slides[current];
      const upcomingInner = ui.inner[current];

      if (!currentSlide || !currentInner || !upcomingSlide || !upcomingInner) {
        animating = false;
        observer?.enable();
        return;
      }

      gsap
        .timeline({
          defaults: { duration: ANIMATION_DURATION, ease: "slideshow-wipe" },
          onStart() {
            upcomingSlide.classList.add("is--current");
            if (ui.thumbs.length) {
              ui.thumbs[previous]?.classList.remove("is--current");
              ui.thumbs[current]?.classList.add("is--current");
            }
          },
          onComplete() {
            currentSlide.classList.remove("is--current");
            animating = false;
            window.setTimeout(() => observer?.enable(), ANIMATION_DURATION * 1000);
          },
        })
        .to(currentSlide, { xPercent: -direction * 100 }, 0)
        .to(currentInner, { xPercent: direction * 50 }, 0)
        .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
        .fromTo(upcomingInner, { xPercent: -direction * 50 }, { xPercent: 0 }, 0);
    }

    function onClickThumb(event: Event) {
      const target = event.currentTarget as HTMLElement;
      const targetIndex = Number.parseInt(target.getAttribute("data-index") ?? "", 10);
      if (Number.isNaN(targetIndex) || targetIndex === current || animating) return;
      navigate(targetIndex > current ? 1 : -1, targetIndex);
    }

    function onClickLeftZone() {
      if (!animating) navigate(-1);
    }

    function onClickRightZone() {
      if (!animating) navigate(1);
    }

    ui.thumbs.forEach((thumb) => thumb.addEventListener("click", onClickThumb));
    ui.hotLeft?.addEventListener("click", onClickLeftZone);
    ui.hotRight?.addEventListener("click", onClickRightZone);

    observer = Observer.create({
      target: el,
      type: "wheel,touch,pointer",
      onLeft: () => {
        if (!animating) navigate(1);
      },
      onRight: () => {
        if (!animating) navigate(-1);
      },
      onWheel: (event) => {
        if (animating) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          if (event.deltaX > 50) navigate(1);
          if (event.deltaX < -50) navigate(-1);
        }
      },
      wheelSpeed: -1,
      tolerance: 10,
    });

    return () => {
      observer?.kill();
      ui.thumbs.forEach((thumb) => thumb.removeEventListener("click", onClickThumb));
      ui.hotLeft?.removeEventListener("click", onClickLeftZone);
      ui.hotRight?.removeEventListener("click", onClickRightZone);
    };
  }, []);

  return wrapRef;
}
