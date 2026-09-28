"use client";

import React from "react";
import type { CarouselApi } from "@relume_io/relume-ui";
import { useState, useEffect } from "react";
import { BiSolidStar } from "react-icons/bi";
import clsx from "clsx";
import { Carousel, CarouselContent, CarouselItem } from "@relume_io/relume-ui";

type ImageProps = {
  src: string;
  alt?: string;
};

type Testimonial = {
  numberOfStars: number;
  quote: string;
  avatar: ImageProps;
  name: string;
  position: string;
  companyName: string;
};

type Props = {
  heading: string;
  description: string;
  testimonials: Testimonial[];
};

export type Testimonial19Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Testimonial19 = (props: Testimonial19Props) => {
  const { heading, description, testimonials } = {
    ...Testimonial19Defaults,
    ...props,
  };

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
          <p className="mea-body-md">{description}</p>
        </div>
        {/* for all available options: https://www.embla-carousel.com/api/options/ */}
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            align: "start",
          }}
          className="overflow-hidden"
        >
          <div className="relative">
            <CarouselContent className="ml-0 md:mx-3.5">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-0 md:basis-1/2 md:px-4 lg:basis-1/3">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => api?.scrollPrev()}
              className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background p-3 shadow-small md:flex md:size-12 lg:size-14"
            >
              <img
                src="/images/landing-pages/arrow_forward.svg"
                alt=""
                className="size-6 rotate-180"
              />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => api?.scrollNext()}
              className="absolute right-0 top-1/2 hidden translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background p-3 shadow-small md:flex md:size-12 lg:size-14"
            >
              <img src="/images/landing-pages/arrow_forward.svg" alt="" className="size-6" />
            </button>
          </div>
          <div className="mt-[30px] flex items-center justify-center md:mt-[46px]">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={clsx("relative mx-[3px] inline-block size-2 rounded-full", {
                  "bg-black": current === index + 1,
                  "bg-neutral-darker/40": current !== index + 1,
                })}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="flex w-full flex-col items-start justify-between border border-border-primary p-6 md:p-8">
      <div className="mb-5 flex md:mb-6">
        {Array(testimonial.numberOfStars)
          .fill(null)
          .map((_, starIndex) => (
            <BiSolidStar key={starIndex} className="size-6" />
          ))}
      </div>
      <blockquote className="mea-body-md">{testimonial.quote}</blockquote>
      <div className="mt-5 flex w-full flex-col items-start gap-4 md:mt-6 md:w-auto md:flex-row md:items-center">
        <div>
          <img
            src={testimonial.avatar.src}
            alt={testimonial.avatar.alt}
            className="size-12 min-h-12 min-w-12 rounded-full object-cover"
          />
        </div>
        <div>
          <p className="mea-text-medium-semibold">{testimonial.name}</p>
          <p className="mea-body-md">
            <span>{testimonial.position}</span>, <span>{testimonial.companyName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Testimonial19Defaults: Props = {
  heading: "Customer stories",
  description: "Our dedication to exceeding expectations is apparent with each customer interaction.",
  testimonials: [
    {
      numberOfStars: 5,
      quote:
        "Midwest EMS Academy's training gave me the skills and confidence I needed. I passed the NREMT exam on the first try and felt prepared for real emergencies from day one on the job.",
      avatar: { src: "/images/instructors/Brower.jpg", alt: "Emily S." },
      name: "Emily S.",
      position: "Certified EMT",
      companyName: "Program Graduate",
    },
    {
      numberOfStars: 5,
      quote:
        "As a working mom, I appreciated Midwest EMS Academy's flexible schedule. I studied online after work and joined hands-on sessions on weekends. I never felt overwhelmed, and now I'm a certified paramedic.",
      avatar: { src: "/images/instructors/Crawford.jpg", alt: "Sarah L." },
      name: "Sarah L.",
      position: "Paramedic",
      companyName: "Program Graduate",
    },
    {
      numberOfStars: 5,
      quote:
        "Our entire fire department uses Midwest EMS Academy for continuing education. The online courses make recertification simple, and we trust the quality. It keeps our team sharp.",
      avatar: { src: "/images/instructors/Hajmohammad.jpg", alt: "Mark D." },
      name: "Mark D.",
      position: "Fire Chief",
      companyName: "Department Partner",
    },
  ],
};
