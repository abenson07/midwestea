import type { ButtonProps } from "@relume_io/relume-ui";

type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  kicker: string;
  heading: string;
  description: string;
  button: ButtonProps;
  backgroundImage: ImageProps;
  foregroundImage: ImageProps;
};

export type Header137Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header137 = (props: Header137Props) => {
  const { kicker, heading, description, button, backgroundImage, foregroundImage } = {
    ...Header137Defaults,
    ...props,
  };
  return (
    <section
      id="relume"
      data-program-hero
      className="grid grid-cols-1 items-center gap-y-16 pt-16 md:pt-24 lg:grid-cols-2 lg:pt-0"
    >
      <div className="mx-[5%] sm:max-w-md md:justify-self-start lg:ml-[5vw] lg:mr-20 lg:justify-self-end">
        <p className="mea-heading-h3 mb-3">{kicker}</p>
        <h1 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h1>
        <p className="mea-body-md">{description}</p>
        <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
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
      <div className="relative flex items-center">
        <div className="absolute w-[45%] pl-[5%] lg:pl-0">
          <img
            src={foregroundImage.src}
            alt={foregroundImage.alt}
            className="aspect-[2/3] w-full rounded-mea-lg object-cover lg:h-full"
          />
        </div>
        <div className="ml-[10%]">
          <img
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            className="w-full rounded-mea-lg object-cover lg:h-screen lg:max-h-[60rem]"
          />
        </div>
      </div>
    </section>
  );
};

export const Header137Defaults: Props = {
  kicker: "Continuing Education",
  heading: "Stay Certified, Stay Sharp.",
  description:
    "Don't let a busy schedule put your EMT or Paramedic license at risk. Midwest EMS Academy offers a wide range of state-approved, on-demand continuing education courses. Complete your required refresher hours anytime, anywhere — and stay ready for the next call with the latest skills and knowledge.",
  button: { title: "Register now" },
  backgroundImage: {
    src: "/images/de80bb7dcfc1d675590d6c698e87dbeb_acls-p-1600.webp",
    alt: "Paramedic completing continuing education",
  },
  foregroundImage: {
    src: "/images/emt-compressions.avif",
    alt: "EMT reviewing recertification requirements",
  },
};
