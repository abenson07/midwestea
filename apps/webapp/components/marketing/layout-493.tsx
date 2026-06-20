"use client";

import clsx from "clsx";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, VideoIframe } from "@relume_io/relume-ui";
import { FaCirclePlay } from "react-icons/fa6";

type ImageProps = {
  src: string;
  alt?: string;
};

type VideoProps = {
  image: ImageProps;
  url: string;
};

type TabProps = {
  heading: string;
  description: React.ReactNode;
  image?: ImageProps;
  video?: VideoProps;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  tabs: TabProps[];
};

export type Layout493Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

function renderTabDescription(text: React.ReactNode) {
  if (typeof text !== "string") return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export const Layout493 = (props: Layout493Props) => {
  const { tagline, heading, description, tabs } = {
    ...Layout493Defaults,
    ...props,
  };
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="relative">
          <div className="w-full pr-0 md:w-1/2 md:pr-6 lg:pr-10">
            <div className="mb-8 w-full md:w-auto">
              <p className="mea-tagline mb-3 md:mb-4">{tagline}</p>
              <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
              <p className="mea-body-md">{description}</p>
            </div>
            <div className="static flex flex-col flex-wrap justify-stretch md:block">
              <div className="relative mb-8 grid auto-cols-fr grid-cols-1 grid-rows-[auto_auto] items-start md:mb-0 md:items-stretch">
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={clsx("cursor-pointer border-b border-border-primary py-4", {
                      "opacity-100": activeTab === index,
                      "opacity-25": activeTab !== index,
                    })}
                  >
                    <h3 className="mea-heading-h5 uppercase">{tab.heading}</h3>
                    <motion.div
                      initial={false}
                      animate={{
                        height: activeTab === index ? "auto" : 0,
                        opacity: activeTab === index ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2">{renderTabDescription(tab.description)}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {tabs.map((tab, index) => {
                  if (activeTab !== index) return null;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="relative bottom-0 left-auto right-0 top-0 flex size-full items-center justify-center md:absolute md:w-1/2 md:pl-6 lg:pl-10"
                    >
                      {tab.image && (
                        <div className="w-full overflow-hidden rounded-mea-lg">
                          <img
                            src={tab.image.src}
                            alt={tab.image.alt}
                            className="aspect-square w-full object-cover"
                          />
                        </div>
                      )}
                      {tab.video && (
                        <Dialog>
                          <DialogTrigger className="relative flex w-full items-center justify-center overflow-hidden rounded-mea-lg">
                            <img
                              src={tab.video.image.src}
                              alt={tab.video.image.alt}
                              className="aspect-square w-full object-cover"
                            />
                            <FaCirclePlay className="absolute z-20 size-16 text-white" />
                            <span className="absolute inset-0 z-10 bg-black/50" />
                          </DialogTrigger>
                          <DialogContent>
                            <VideoIframe video={tab.video.url} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Layout493Defaults: Props = {
  tagline: "Tagline",
  heading: "Medium length section heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  tabs: [
    {
      heading: "Short heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 1",
      },
    },
    {
      heading: "Short heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      video: {
        image: {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-video-thumbnail.svg",
          alt: "Relume placeholder image 2",
        },
        url: "https://www.youtube.com/embed/8DKLYsikxTs?si=Ch9W0KrDWWUiCMMW",
      },
    },
    {
      heading: "Short heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 3",
      },
    },
  ],
};