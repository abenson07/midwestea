type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  image: ImageProps;
  children: React.ReactNode;
};

export type Content2Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Content2 = (props: Content2Props) => {
  const { heading, children, image } = {
    ...Content2Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-2 md:gap-x-12 lg:gap-x-20">
          <div>
            <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
            <div className="flex flex-col gap-4">{children}</div>
          </div>
          <div className="rounded-mea-lg overflow-hidden">
            <img src={image.src} className="w-full object-cover" alt={image.alt} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Content2Defaults: Props = {
  heading: "Mike's story",
  children: (
    <>
      <p className="mea-body-md">
        Mike has been a paramedic for eleven years. Between his shifts and being a father of
        three, keeping up with continuing education always felt like one more thing on an
        already-full plate.
      </p>
      <p className="mea-body-md">
        When his recertification deadline started creeping up, Mike didn&apos;t want to sit
        through another in-person weekend course away from his kids. He signed up for Midwest EMS
        Academy&apos;s online Paramedic refresher bundle instead.
      </p>
      <p className="mea-body-md">
        He worked through the modules in short blocks — during lunch breaks at the station, after
        the kids were in bed, whenever he had twenty minutes to spare. Nothing about his schedule
        had to change.
      </p>
      <p className="mea-body-md">
        The material itself wasn&apos;t just a formality, either. The refresher covered updated
        protocols Mike hadn&apos;t seen since his last recert, and a few skills he&apos;d gotten
        rusty on without realizing it.
      </p>
      <p className="mea-body-md">
        He finished his required hours two weeks before his deadline, with his certification
        renewed and no missed shifts or missed family dinners along the way.
      </p>
      <p className="mea-body-md">
        &ldquo;I went in just trying to check a box,&rdquo; Mike says, &ldquo;but I came out
        sharper — so when the next emergency hits, you&apos;re ready.&rdquo;
      </p>
    </>
  ),
  image: {
    src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
    alt: "Relume placeholder image",
  },
};
