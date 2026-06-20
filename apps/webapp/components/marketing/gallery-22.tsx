"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@relume_io/relume-ui";
import type { CarouselApi } from "@relume_io/relume-ui";
import clsx from "clsx";

type ImageProps = {
  src: string;
  alt?: string;
};

type SkillSlide = {
  image: ImageProps;
  tagline: string;
  heading: string;
  description: string;
  tags: string[];
};

type Props = {
  heading: string;
  description: string;
  images: ImageProps[];
  slides?: SkillSlide[];
};

export type Gallery22Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

function SkillSlideCard({ slide }: { slide: SkillSlide }) {
  return (
    <div className="grid h-full grid-cols-1 overflow-hidden rounded-mea-sm bg-neutral-lightest shadow-small md:grid-cols-2">
      <div className="relative min-h-[12rem] md:min-h-0">
        <img
          src={slide.image.src}
          alt={slide.image.alt}
          className="aspect-[3/2] size-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 p-4 md:p-6">
        <div>
          <p className="text-xs text-neutral-dark">{slide.tagline}</p>
          <h4 className="mea-heading-h4 mt-1">{slide.heading}</h4>
        </div>
        <p className="text-sm leading-relaxed">{slide.description}</p>
        <div className="flex flex-wrap gap-2">
          {slide.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-mea-sm border border-white bg-white px-3 py-1 text-sm font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Gallery22 = (props: Gallery22Props) => {
  const { heading, description, images, slides } = {
    ...Gallery22Defaults,
    ...props,
  };

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  const carouselItems = slides ?? images;
  const isSkillSlides = Boolean(slides?.length);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section id="relume" className="overflow-hidden px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 md:mb-18 lg:mb-20">
          <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
          {description ? <p className="mea-body-md">{description}</p> : null}
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            loop: false,
            align: "start",
          }}
        >
          <CarouselContent className="ml-0">
            {isSkillSlides
              ? slides!.map((slide, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-[85vw] pl-0 pr-6 md:basis-[60vw] md:pr-8"
                  >
                    <SkillSlideCard slide={slide} />
                  </CarouselItem>
                ))
              : images.map((image, index) => (
                  <CarouselItem key={index} className="basis-1/2 pl-0 pr-6 md:basis-1/3 md:pr-8">
                    <div className="w-full">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="aspect-square size-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
          </CarouselContent>
          <div className="rt-8 mt-8 flex items-center justify-between">
            <div className="mt-5 flex w-full items-start justify-start">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={clsx("mx-[3px] inline-block size-2 rounded-full", {
                    "bg-black": current === index + 1,
                    "bg-neutral-light": current !== index + 1,
                  })}
                />
              ))}
            </div>
            <div className="flex items-end justify-end gap-2 md:gap-4">
              <CarouselPrevious className="static right-0 top-0 size-12 -translate-y-0" />
              <CarouselNext className="static right-0 top-0 size-12 -translate-y-0" />
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export const Gallery22Defaults: Props = {
  heading: "Image Gallery",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  images: [
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 1",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 2",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 3",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 4",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 5",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 6",
    },
  ],
};
