"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { ensureGsapScrollTrigger, gsap } from "@/lib/marketing/gsap";
import { homePrograms, type ProgramItem } from "@/lib/marketing/home-page-data";

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="size-6 shrink-0"
    >
      <path
        d="M15.0412 12.6813H6.85175C6.60708 12.6813 6.404 12.6005 6.2425 12.4388C6.08083 12.2771 6 12.074 6 11.8295C6 11.585 6.08083 11.382 6.2425 11.2203C6.404 11.0586 6.60708 10.9778 6.85175 10.9778H15.0412L11.5087 7.43929C11.3387 7.27329 11.2579 7.07537 11.2662 6.84554C11.2746 6.6157 11.3637 6.41579 11.5337 6.24579C11.6997 6.07995 11.8967 5.99804 12.1245 6.00004C12.3523 6.00187 12.5512 6.08579 12.7212 6.25179L17.7022 11.2268C17.7936 11.3181 17.8599 11.4135 17.9012 11.5128C17.9424 11.612 17.963 11.7175 17.963 11.8295C17.963 11.9415 17.9424 12.0471 17.9012 12.1463C17.8599 12.2456 17.7936 12.341 17.7022 12.4323L12.7462 17.3823C12.5762 17.5483 12.3773 17.6322 12.1495 17.634C11.9217 17.636 11.7247 17.5521 11.5587 17.3823C11.3887 17.2163 11.3037 17.0142 11.3037 16.776C11.3037 16.5379 11.3887 16.3338 11.5587 16.1638L15.0412 12.6813Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProgramCard({ program }: { program: ProgramItem }) {
  return (
    <div className="mr-32 flex shrink-0 items-start gap-5 last:pr-[50vw] md:mr-44 md:gap-8">
      <img
        src={program.image}
        alt=""
        className="hidden h-[70vh] w-auto max-w-none shrink-0 object-contain md:-mr-6 md:block"
      />
      <img
        src={program.mobileImage}
        alt=""
        className="h-[50vh] w-auto max-w-none shrink-0 object-contain md:hidden"
      />
      <div className="mt-28 flex flex-col items-start gap-6">
        <div className="flex flex-col whitespace-nowrap">
          {program.titleLines.map((line) => (
            <h3 key={line} className="mea-heading-h3 uppercase">
              {line}
            </h3>
          ))}
        </div>
        <Link href={program.href} className="mea-button-secondary">
          Learn more
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}

type Props = {
  mission?: string;
  programs?: ProgramItem[];
};

export type HomeProgramsProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function HomePrograms(props: HomeProgramsProps) {
  const {
    mission = "Training the Midwest's Finest to serve with purpose and always ready to answer the calls",
    programs = homePrograms,
    className,
  } = props;

  const sectionRef = useRef<HTMLElement>(null);
  const dollyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapScrollTrigger();
    const section = sectionRef.current;
    const dolly = dollyRef.current;
    if (!section || !dolly) return;

    const tween = gsap.to(dolly, {
      x: () => -(dolly.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(dolly.scrollWidth, window.innerWidth)}`,
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [programs]);

  return (
    <section ref={sectionRef} className={clsx("relative bg-background", className)}>
      <div className="sticky top-0 flex h-svh overflow-hidden">
        <img
          src="/images/company-watermark.avif"
          alt=""
          className="pointer-events-none absolute -top-[5vh] h-[90vh] opacity-50"
          aria-hidden
        />
        <div ref={dollyRef} className="flex items-center pr-[50vw]">
          <div className="mx-[10vw] w-[80vw] shrink-0 text-center">
            <h3 className="mea-heading-h3-sentence mx-auto max-w-4xl">{mission}</h3>
            <div className="relative mx-auto mt-8 flex h-[2.625rem] w-[8.25rem] items-center justify-center">
              <img
                src="/images/Company-Logo.svg"
                alt="Midwest Emergency Academy"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="flex items-center pl-20">
            {programs.map((program) => (
              <ProgramCard key={program.href} program={program} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
