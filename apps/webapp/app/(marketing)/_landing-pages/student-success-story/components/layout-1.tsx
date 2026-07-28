import clsx from "clsx";
import type { ButtonProps } from "@relume_io/relume-ui";
import { BiCheck } from "react-icons/bi";

type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  description: string;
  button?: ButtonProps;
  checklist?: string[];
  image: ImageProps;
  imagePosition?: "left" | "right";
};

export type Layout1Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Layout1 = (props: Layout1Props) => {
  const { heading, description, button, checklist, image, imagePosition } = {
    ...Layout1Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div
            className={clsx(
              "rounded-mea-lg overflow-hidden",
              imagePosition === "left" ? "md:order-1" : "md:order-2",
            )}
          >
            <img src={image.src} className="w-full object-cover" alt={image.alt} />
          </div>
          <div className={imagePosition === "left" ? "md:order-2" : "md:order-1"}>
            <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
            <p className="mea-body-md">{description}</p>
            {checklist && checklist.length > 0 ? (
              <ul className="mt-6 flex flex-col gap-4 md:mt-8">
                {checklist.map((item) => (
                  <li key={item} className="mea-body-md flex items-center gap-4">
                    <BiCheck className="size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : button ? (
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                {"url" in button && button.url ? (
                  <a
                    href={button.url as string}
                    className="mea-button-secondary"
                    title={button.title}
                  >
                    {button.title}
                  </a>
                ) : (
                  <button type="button" className="mea-button-secondary">
                    {button.title}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Layout1Defaults: Props = {
  heading: "Medium length section heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  button: { title: "Explore programs" },
  image: {
    src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
    alt: "Relume placeholder image",
  },
  imagePosition: "right",
};
