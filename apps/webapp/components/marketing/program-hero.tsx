"use client";

import { registerLinkAttributes } from "@/lib/marketing/register-link";
import clsx from "clsx";
import { useRef } from "react";
import { useHeroVideoScrub } from "@/hooks/marketing/use-hero-video-scrub";

type VideoProps = {
  poster: string;
  mp4: string;
  webm?: string;
};

type Props = {
  titleLines: string[];
  description: string;
  classStartLabel: string;
  classStartDate: string;
  priceNote: string;
  variant?: "waitlist" | "register";
  waitlistLabel?: string;
  registerLabel?: string;
  registerHref?: string;
  registerPrice?: string;
  video: VideoProps;
  scrollHeight?: "150vh" | "300vh";
};

export type ProgramHeroProps = React.ComponentPropsWithoutRef<"div"> & Partial<Props>;

export const ProgramHero = (props: ProgramHeroProps) => {
  const {
    titleLines,
    description,
    classStartLabel,
    classStartDate,
    priceNote,
    variant = "waitlist",
    waitlistLabel = "Coming soon",
    registerLabel = "Register now for just",
    registerHref = "#",
    registerPrice,
    video,
    scrollHeight = "150vh",
    className,
  } = {
    ...ProgramHeroDefaults,
    ...props,
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useHeroVideoScrub(trackRef, videoRef);

  return (
    <div
      ref={trackRef}
      data-program-hero
      className={clsx("relative", scrollHeight === "300vh" ? "h-[300vh]" : "h-[150vh]", className)}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            poster={video.poster}
            className="size-full object-cover"
          >
            {video.webm ? <source src={video.webm} type="video/webm" /> : null}
            <source src={video.mp4} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-neutral-darkest/40" aria-hidden />
        </div>

        <div className="relative z-10 flex h-full flex-col px-[5%] pb-8 pt-[var(--mea-nav-height)] md:pb-16">
          <div className="container flex h-full flex-col gap-8 md:flex-row md:items-stretch md:justify-between md:gap-12">
            <div className="flex flex-1 flex-col justify-center md:max-w-[42rem]">
              <div className="mb-4 flex gap-2 md:hidden">
                <span className="text-sm font-semibold uppercase text-text-alternative">
                  {classStartLabel}
                </span>
                <span className="text-sm font-semibold uppercase text-text-alternative">
                  {classStartDate}
                </span>
              </div>

              <h1 className="mea-heading-h2 mb-5 uppercase text-text-alternative md:mb-6">
                {titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              <p className="text-text-alternative md:text-md">{description}</p>
            </div>

            <div className="flex flex-col justify-end md:max-w-md md:pb-8 lg:pb-16">
              <div className="hidden gap-2 md:flex">
                <span className="mea-heading-h5 uppercase text-text-alternative">
                  {classStartLabel}
                </span>
                <span className="mea-heading-h5 uppercase text-text-alternative">
                  {classStartDate}
                </span>
              </div>

              <p className="mt-3 hidden text-text-alternative md:mt-4 md:block md:text-md">
                {priceNote}
              </p>

              <div className="mt-6 md:mt-8">
                {variant === "waitlist" ? (
                  <span className="inline-flex items-center rounded-mea-xs border border-mea-yellow bg-neutral-lightest px-6 py-3 text-base font-semibold text-text">
                    {waitlistLabel}
                  </span>
                ) : (
                  <a
                    href={registerHref}
                    className="mea-button-primary inline-flex items-center gap-1"
                    {...registerLinkAttributes(registerHref)}
                  >
                    {registerLabel}
                    {registerPrice ? `$${registerPrice}` : null}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgramHeroDefaults: Props = {
  titleLines: ["Emergency Medical", "Responder"],
  description:
    "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives.",
  classStartLabel: "Next class starts",
  classStartDate: "November",
  priceNote:
    "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $750.",
  variant: "waitlist",
  waitlistLabel: "Coming soon",
  registerHref: "#",
  video: {
    poster: "/videos/emr-hero-vid-2_poster.jpg",
    mp4: "/videos/emr-hero-vid-2_mp4.mp4",
    webm: "/videos/emr-hero-vid-2_webm.webm",
  },
};
