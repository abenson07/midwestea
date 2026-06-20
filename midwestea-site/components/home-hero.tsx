"use client";

import clsx from "clsx";
import { useHomeHeroSlideshow } from "@/hooks/use-home-hero-slideshow";
import { homeHeroSlides, type HeroSlide } from "@/lib/home-page-data";

type Props = {
  slides?: HeroSlide[];
  headline?: string[];
};

export type HomeHeroProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function HomeHero(props: HomeHeroProps) {
  const {
    slides = homeHeroSlides,
    headline = ["Calling", "All", "Responders"],
    className,
  } = props;

  const wrapRef = useHomeHeroSlideshow();

  return (
    <section className={clsx("h-svh bg-neutral-darkest", className)}>
      <div ref={wrapRef} data-slideshow="wrap" className="home-hero-slider h-full">
        <div className="home-hero-slider__list">
          {slides.map((slide, index) => (
            <div
              key={slide.image}
              data-slideshow="slide"
              className={clsx("home-hero-slider__slide", index === 0 && "is--current")}
            >
              <img
                data-slideshow="parallax"
                src={slide.image}
                alt=""
                draggable={false}
                className="home-hero-slider__image"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          data-slideshow="hot-left"
          aria-label="Previous slide"
          className="home-hero-slider__hotzone left-0 border-0 bg-transparent p-0"
        />
        <button
          type="button"
          data-slideshow="hot-right"
          aria-label="Next slide"
          className="home-hero-slider__hotzone right-0 border-0 bg-transparent p-0"
        />

        <div className="home-hero-slider__headline">
          <div className="home-hero-slider__spacer home-hero-slider__spacer--one">
            <h1 className="mea-heading-h1 hero-mobile-heading text-text-alternative">{headline[0]}</h1>
          </div>
          <div className="home-hero-slider__spacer home-hero-slider__spacer--two">
            <h1 className="mea-heading-h1 hero-mobile-heading text-text-alternative">{headline[1]}</h1>
          </div>
          <div className="home-hero-slider__spacer" aria-hidden />
          <div className="home-hero-slider__spacer home-hero-slider__spacer--four">
            <h1 className="mea-heading-h1 hero-mobile-heading text-text-alternative">{headline[2]}</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
