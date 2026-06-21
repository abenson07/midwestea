"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@relume_io/relume-ui";
import type { CarouselApi } from "@relume_io/relume-ui";
import { homeCourseSlides, type CourseSlide } from "@/lib/marketing/home-page-data";

function SliderArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      className="flex size-12 items-center justify-center rounded-full border border-neutral-darkest bg-neutral-lightest text-neutral-darkest transition-opacity disabled:opacity-30"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        {direction === "prev" ? (
          <path
            d="M3.31066 8.75001L9.03033 14.4697L7.96967 15.5303L0.439339 8.00001L7.96967 0.469676L9.03033 1.53034L3.31066 7.25001L15.5 7.25L15.5 8.75L3.31066 8.75001Z"
            fill="currentColor"
          />
        ) : (
          <path
            d="M12.6893 7.25L6.96967 1.53033L8.03033 0.469666L15.5607 8L8.03033 15.5303L6.96967 14.4697L12.6893 8.75H0.5V7.25H12.6893Z"
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  );
}

function CourseSlideCard({ course }: { course: CourseSlide }) {
  return (
    <Link
      href={course.href}
      className="relative block aspect-[2/3] w-full max-w-[20.375rem] overflow-hidden rounded-mea-sm"
    >
      <img src={course.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 flex flex-col justify-end gap-4 bg-gradient-to-t from-[#070707] to-transparent p-4">
        <h4 className="mea-heading-h4 normal-case text-text-alternative">{course.title}</h4>
        <div className="flex w-full items-end justify-between gap-4">
          <div>{course.price}</div>
          <div className="text-sm opacity-60">View course</div>
        </div>
      </div>
    </Link>
  );
}

type Props = {
  tagline?: string;
  heading?: string;
  description?: string;
  courses?: CourseSlide[];
};

export type CoursesHomeProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function CoursesHome(props: CoursesHomeProps) {
  const {
    tagline = "Certification courses",
    heading = "Master the essentials",
    description = "Our certification courses are designed for those who need to refresh their skills and stay updated with the latest techniques. Whether you're returning to the field or looking to enhance your expertise, our programs provide the knowledge and confidence you need to excel.",
    courses = homeCourseSlides,
    className,
  } = props;

  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const images = document.querySelectorAll<HTMLImageElement>(
      ".courses-home-carousel img",
    );
    let pending = images.length;

    const handleImageLoad = () => {
      pending -= 1;
      if (pending <= 0) api.reInit();
    };

    if (pending === 0) {
      api.reInit();
      return;
    }

    images.forEach((image) => {
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener("load", handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach((image) => image.removeEventListener("load", handleImageLoad));
    };
  }, [api, courses]);

  return (
    <section className={clsx("overflow-x-clip bg-neutral-darkest text-text-alternative", className)}>
      <div className="px-[5%] py-16 md:py-24 lg:py-28">
        <div className="container">
          <div className="max-w-3xl">
            <div className="mea-tagline">{tagline}</div>
            <div className="mt-2" />
            <h2 className="mea-heading-h2">{heading}</h2>
            <p className="mea-body-md mt-4 max-w-2xl">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pb-16 md:mt-20 md:pb-24 lg:pb-28">
        <div className="pl-[5%]">
          <Carousel
            setApi={setApi}
            opts={{
              loop: false,
              align: "start",
            }}
            className="courses-home-carousel"
          >
            <CarouselContent className="ml-0 items-start">
              {courses.map((course) => (
                <CarouselItem
                  key={course.href}
                  className="basis-[85%] shrink-0 pr-4 pl-0 sm:basis-[20.375rem]"
                >
                  <CourseSlideCard course={course} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 px-[5%]">
          <SliderArrow
            direction="prev"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
          />
          <SliderArrow
            direction="next"
            disabled={!canScrollNext}
            onClick={() => api?.scrollNext()}
          />
        </div>
      </div>
    </section>
  );
}
