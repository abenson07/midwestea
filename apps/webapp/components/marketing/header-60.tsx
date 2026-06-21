import clsx from "clsx";

type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  headingPrefix?: string;
  description: string;
  image: ImageProps;
  /** When true, hero extends under the fixed nav/banner. Defaults to true. */
  overlayNav?: boolean;
};

export type Header60Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header60 = (props: Header60Props) => {
  const { heading, headingPrefix, description, image, overlayNav = true } = {
    ...Header60Defaults,
    ...props,
  };

  return (
    <section
      id="relume"
      className={clsx(
        "relative px-[5%]",
        overlayNav
          ? "flex min-h-[70vh] items-end pb-16 md:pb-24 lg:pb-28"
          : "py-16 md:py-24 lg:py-28",
      )}
    >
      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 md:grid-cols-2 lg:gap-x-20 lg:gap-y-16">
          <div>
            {headingPrefix ? (
              <h1 className="mea-heading-h4 uppercase text-text-alternative">{headingPrefix}</h1>
            ) : null}
            <h1 className="mea-heading-h1 text-text-alternative">{heading}</h1>
          </div>
          <p className="text-text-alternative md:text-md">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 z-0">
        <img src={image.src} className="size-full object-cover" alt={image.alt} />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </section>
  );
};

export const Header60Defaults: Props = {
  heading: "Short heading here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  overlayNav: true,
  image: {
    src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
    alt: "Relume placeholder image",
  },
};
