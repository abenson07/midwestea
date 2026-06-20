"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { waysToLearnCards, type WaysToLearnCard } from "@/lib/home-page-data";

type CardId = WaysToLearnCard["id"];

const CARD_OFFSETS: Record<CardId, number> = {
  online: 0,
  inperson: -0.1,
  career: -0.2,
};

type Props = {
  tagline?: string;
  heading?: string;
  description?: string;
};

export type WaysToLearnProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function WaysToLearn(props: WaysToLearnProps) {
  const {
    tagline = "Your money goes further with Us",
    heading = "Flexible Paths, One Standard of Excellence",
    description = "Just starting your training or renewing your certification? Every MidwestEA program, from online courses to full paramedic instruction, meets state and NREMT standards to keep you field-ready.",
    className,
  } = props;

  const [activeTab, setActiveTab] = useState<CardId>("inperson");
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((key: CardId) => {
    setActiveTab((current) => (current === key ? current : key));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      const isDesktop = window.innerWidth >= 569;
      const x = isDesktop ? CARD_OFFSETS[activeTab] * window.innerWidth : 0;

      gsap.to(track, {
        x,
        duration: isDesktop ? 0.6 : 0.3,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    animate();
    window.addEventListener("resize", animate);
    return () => window.removeEventListener("resize", animate);
  }, [activeTab]);

  return (
    <section className={clsx("bg-background", className)}>
      <div className="px-[5%] py-16 md:py-24 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mea-tagline">{tagline}</div>
            <div className="mt-2" />
            <h2 className="mea-heading-h2">{heading}</h2>
            <p className="mea-body-md mx-auto mt-4 max-w-2xl">{description}</p>
            <div className="mt-6 hidden min-[569px]:flex min-[569px]:justify-center">
              <div className="inline-flex rounded-mea-sm bg-neutral-lightest p-2">
                {waysToLearnCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => goTo(card.id)}
                    className={clsx(
                      "cursor-pointer rounded-mea-sm border px-4 py-2 text-base transition-colors",
                      activeTab === card.id
                        ? "border-mea-red bg-white font-semibold text-text"
                        : "border-neutral-lightest bg-neutral-lightest text-text hover:opacity-80",
                    )}
                  >
                    {card.tabLabel ?? card.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-screen overflow-hidden max-[568px]:px-4">
        <div ref={trackRef} className="flex max-[568px]:flex-col max-[568px]:gap-6">
          {waysToLearnCards.map((card) => (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => goTo(card.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goTo(card.id);
                }
              }}
              className="flex w-[40vw] shrink-0 cursor-pointer flex-col px-4 max-[568px]:w-full max-[568px]:px-0"
            >
              <div className="w-full">
                <img
                  src={card.image}
                  alt=""
                  className="aspect-[3/2] w-full rounded-mea-sm object-cover"
                  draggable={false}
                />
              </div>
              <div className="flex flex-1 flex-col justify-between pt-4 max-[568px]:pb-6">
                <div>
                  <h3 className="mea-heading-h4 normal-case">{card.label}</h3>
                  <p className="mt-2 text-base leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
