"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { ensureGsapScrollTrigger, gsap } from "@/lib/marketing/gsap";

type Props = {
  quote?: string;
};

export type HomeTestimonialProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function HomeTestimonial(props: HomeTestimonialProps) {
  const {
    quote = "“I knocked out my CPR renewal during my lunch break. Everything was straightforward, and I got my certificate immediately.”",
    className,
  } = props;

  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapScrollTrigger();
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tween = gsap.fromTo(
        content,
        { y: 0 },
        {
          y: "100vh",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={clsx("home-testimonial text-center text-text-alternative", className)}
    >
      <div ref={contentRef} className="px-[5%]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mea-heading-h2 normal-case leading-[0.9]">{quote}</h2>
        </div>
      </div>
    </section>
  );
}
