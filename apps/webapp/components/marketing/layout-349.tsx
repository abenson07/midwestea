"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { SplitHeading } from "@/components/marketing/split-heading";

type ImageProps = {
  src: string;
  alt?: string;
};

type ContentProps = {
  heading: string;
  description: string;
  image: ImageProps;
  tags?: string[];
};

type Props = {
  contents: ContentProps[];
};

export type Layout349Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Layout349 = (props: Layout349Props) => {
  const { contents } = {
    ...Layout349Defaults,
    ...props,
  };

  const [activeSection, setActiveSection] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const panels = panelRefs.current.filter((panel): panel is HTMLDivElement => panel !== null);
    if (panels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const index = panels.indexOf(visible[0].target as HTMLDivElement);
        if (index !== -1) setActiveSection(index);
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [contents.length]);

  return (
    <section id="relume" className="px-[5%] pt-16 md:pt-24 lg:pt-28">
      <div className="container">
        <div className="relative grid gap-x-12 py-16 sm:gap-y-12 md:grid-cols-2 md:py-0 lg:gap-x-20">
          <div className="grid grid-cols-1 gap-12 md:block">
            {contents.map((content, index) => (
              <div key={index}>
                <div
                  ref={(element) => {
                    panelRefs.current[index] = element;
                  }}
                  className="flex flex-col items-start justify-center md:h-screen"
                >
                  <SplitHeading
                    text={content.heading}
                    className="mea-heading-h2 mb-5 md:mb-6"
                  />
                  <p className="md:text-md">{content.description}</p>
                  {content.tags?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {content.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-mea-sm border border-neutral-lightest bg-neutral-lightest px-3 py-1 text-sm font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-10 block w-full md:hidden">
                    <img src={content.image.src} className="w-full" alt={content.image.alt} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sticky top-0 hidden h-screen md:block">
            <div className="relative flex h-full w-full items-center">
              {contents.map((content, index) => (
                <img
                  key={index}
                  src={content.image.src}
                  className={clsx("absolute inset-0 size-full object-cover transition-opacity duration-300", {
                    "opacity-100": activeSection === index,
                    "opacity-0": activeSection !== index,
                  })}
                  alt={content.image.alt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Layout349Defaults: Props = {
  contents: [
    {
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-1.svg",
        alt: "Relume placeholder image 1",
      },
    },
    {
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-2.svg",
        alt: "Relume placeholder image 2",
      },
    },
    {
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-3.svg",
        alt: "Relume placeholder image 3",
      },
    },
    {
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-4.svg",
        alt: "Relume placeholder image 4",
      },
    },
  ],
};
