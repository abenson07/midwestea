type ImageProps = {
  src: string;
  alt?: string;
};

type SectionProps = {
  icon: ImageProps;
  heading: string;
  description: string;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  sections: SectionProps[];
};

export type Layout241Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Layout241 = (props: Layout241Props) => {
  const { tagline, heading, description, sections } = {
    ...Layout241Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="flex flex-col">
          <div className="rb-12 mb-12 md:mb-18 lg:mb-20">
            <div className="w-full max-w-lg">
              <p className="mea-tagline mb-3">{tagline}</p>
              <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
              <p className="mea-body-md">{description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            {sections.map((section, index) => (
              <div key={index} className="flex w-full flex-col">
                <div className="mb-5 md:mb-6">
                  <img src={section.icon.src} className="size-12" alt={section.icon.alt} />
                </div>
                <h3 className="mea-heading-h4 mb-5 md:mb-6">{section.heading}</h3>
                <p className="mea-body-md">{section.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Layout241Defaults: Props = {
  tagline: "Tagline",
  heading: "Medium length section heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  sections: [
    {
      icon: {
        src: "/images/landing-pages/book_ribbon.svg",
        alt: "Book ribbon icon",
      },
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
    {
      icon: {
        src: "/images/landing-pages/ink_pen.svg",
        alt: "Ink pen icon",
      },
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
    {
      icon: {
        src: "/images/landing-pages/handshake.svg",
        alt: "Handshake icon",
      },
      heading: "Medium length section heading goes here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    },
  ],
};