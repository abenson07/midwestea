"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRef } from "react";
import { useProgramsScroller } from "@/hooks/marketing/use-programs-scroller";
import {
  programGalleryPanels,
  type ProgramGalleryPanel,
} from "@/lib/marketing/programs-gallery-data";

function ProgramPanel({ program }: { program: ProgramGalleryPanel }) {
  return (
    <>
      <div className="program-ui pointer-events-none absolute inset-0 z-10 mx-auto flex w-full max-w-[80rem] gap-20 px-[5%] pb-0 pt-[calc(var(--mea-nav-height)+78px)] md:flex-row md:items-stretch md:justify-center lg:pt-[78px] max-md:mt-[16.5rem] max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-8 max-md:py-5 max-sm:justify-end max-sm:pb-4">
        <div className="flex flex-1 flex-col items-start justify-center gap-4 max-md:items-center max-md:text-center max-sm:flex-none">
          <h2 className="mea-heading-h2 uppercase text-text-alternative">{program.title}</h2>
          <p className="text-base text-text-alternative md:text-md">{program.description}</p>
        </div>
        <div className="pointer-events-auto flex flex-1 flex-col items-start justify-end gap-4 pb-16 max-md:w-full max-md:items-center max-md:justify-center max-md:pb-0 max-md:text-center max-sm:flex-none">
          <div className="flex gap-1.5">
            <h4 className="mea-heading-h4 uppercase text-text-alternative">
              {program.classLabel}
            </h4>
            <h4 className="mea-heading-h4 uppercase text-text-alternative">{program.classDate}</h4>
          </div>
          <p className="text-base text-text-alternative md:text-md">{program.priceNote}</p>
          <Link href={program.href} className="mea-button-primary">
            Learn more
          </Link>
        </div>
      </div>
      <img
        src={program.image}
        alt=""
        className="program-media absolute inset-0 size-full object-cover"
      />
    </>
  );
}

type Props = {
  programs?: ProgramGalleryPanel[];
};

export type ProgramsScrollerProps = React.ComponentPropsWithoutRef<"div"> & Partial<Props>;

export function ProgramsScroller(props: ProgramsScrollerProps) {
  const { programs = programGalleryPanels, className } = props;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useProgramsScroller(scrollerRef, viewportRef, panelRefs);

  return (
    <div ref={scrollerRef} className={clsx("programs-scroller relative mx-auto", className)}>
      <div
        ref={viewportRef}
        className="programs-viewport relative z-[1] min-h-svh w-full overflow-hidden rounded-mea-sm bg-black"
        style={{ transform: "scale(0.95)" }}
      >
        {programs.map((program, index) => (
          <div
            key={program.href}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            className="program-panel relative flex h-svh items-stretch justify-center px-[5%] pt-[6.1rem] text-text-alternative"
          >
            <ProgramPanel program={program} />
          </div>
        ))}
      </div>
    </div>
  );
}
