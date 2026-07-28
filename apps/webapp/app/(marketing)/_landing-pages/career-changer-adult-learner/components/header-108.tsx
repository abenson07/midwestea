"use client";

import type { ButtonProps } from "@relume_io/relume-ui";
import { useMediaQuery } from "@relume_io/relume-ui";
import { motion, useScroll, useTransform } from "framer-motion";

type ImageProps = {
  src: string;
  alt: string;
};

type Props = {
  title: string;
  description: string;
  button: ButtonProps;
  images: ImageProps[];
};

export type Header108Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header108 = (props: Header108Props) => {
  const { title, description, button, images } = {
    ...Header108Defaults,
    ...props,
  };

  const isMobile = useMediaQuery("(max-width: 767px)");
  const { scrollYProgress } = useScroll();

  const createTransform = (mobileValues: string[], desktopValues: string[]) =>
    useTransform(scrollYProgress, [0, 1], isMobile ? mobileValues : desktopValues);

  const leftImageGroup = {
    x: createTransform(["0vw", "-25vw"], ["0vw", "-32vw"]),
  };

  const centerImageContainer = {
    x: createTransform(["0vw", "-25vw"], ["0vw", "-32vw"]),
    width: createTransform(["50vw", "100vw"], ["36vw", "100vw"]),
    height: createTransform(["60vh", "100vh"], ["80vh", "100vh"]),
  };

  const rightImageGroup = {
    x: createTransform(["0vw", "25vw"], ["0vw", "32vw"]),
  };

  return (
    <section id="relume" data-program-hero className="relative h-[250vh]">
      <div className="px-[5%] pt-16 md:pt-24 lg:pt-28">
        <div className="container">
          <div className="mx-auto w-full max-w-lg text-center">
            <h1 className="mea-heading-h2 mb-5 md:mb-6">{title}</h1>
            <p className="mea-body-md">{description}</p>
            <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
              {"url" in button && button.url ? (
                <a href={button.url as string} className="mea-button-primary" title={button.title}>
                  {button.title}
                </a>
              ) : (
                <button type="button" className="mea-button-primary">
                  {button.title}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="z-10 grid h-[60vh] w-full grid-flow-col grid-cols-[25%_50%_25%]  content-center items-center justify-center md:h-[70vh] md:grid-cols-[32%_36%_32%] lg:h-[80vh]">
          <motion.div
            className="grid grid-flow-col grid-cols-1 items-center justify-items-end gap-4 justify-self-end px-4"
            style={leftImageGroup}
          >
            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <img className="aspect-[2/3] w-full object-cover" {...images[0]} />
            </div>

            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative">
                <img className="aspect-square w-full object-cover" {...images[1]} />
              </div>
              <div className="relative">
                <img className="aspect-[3/4] w-full object-cover" {...images[2]} />
              </div>
            </div>
          </motion.div>

          <motion.div className="relative" style={centerImageContainer}>
            <img className="size-full object-cover" {...images[3]} />
          </motion.div>

          <motion.div
            className="grid grid-flow-col items-center justify-items-start gap-4 justify-self-start px-4"
            style={rightImageGroup}
          >
            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative w-[40vw] sm:w-auto">
                <img className="aspect-[3/4] w-full object-cover" {...images[4]} />
              </div>
              <div className="relative w-[40vw] sm:w-auto">
                <img className="aspect-square w-full object-cover" {...images[5]} />
              </div>
            </div>

            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <img className="aspect-[2/3] w-full object-cover" {...images[6]} />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 mt-[100vh]" />
    </section>
  );
};

export const Header108Defaults: Props = {
  title: "Start a New EMS Career Without Quitting Your Day Job",
  description:
    "It's never too late to follow your passion. Midwest EMS Academy offers flexible EMT and Paramedic training programs built for working adults. Keep your job, keep your family commitments, and still get the training you need to launch a rewarding career in emergency services.",
  button: { title: "Get started" },
  images: [
    { src: "/images/emt-hero.avif", alt: "EMT student training" },
    { src: "/images/emt.avif", alt: "EMT in the field" },
    { src: "/images/emt-compressions.avif", alt: "EMT performing chest compressions" },
    { src: "/images/paramedic-1.avif", alt: "Paramedic on duty" },
    { src: "/images/paramedic.avif", alt: "Paramedic training" },
    { src: "/images/ems.avif", alt: "EMS professionals" },
    { src: "/images/student-studying.png", alt: "Adult learner studying at home" },
  ],
};
