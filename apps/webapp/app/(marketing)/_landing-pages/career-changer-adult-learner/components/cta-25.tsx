import type { ButtonProps } from "@relume_io/relume-ui";

type Props = {
  heading: string;
  description: string;
  button: ButtonProps;
};

export type Cta25Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Cta25 = (props: Cta25Props) => {
  const { heading, description, button } = {
    ...Cta25Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
        <p className="mea-body-md">{description}</p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
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
    </section>
  );
};

export const Cta25Defaults: Props = {
  heading: "Ready to take the leap?",
  description:
    "You don't have to choose between your current life and your dream career. Midwest EMS Academy provides a bridge from where you are to where you want to be. If you're ready for a change, we're ready to help you every step of the way. Your new EMS career can start today.",
  button: { title: "Enroll today" },
};
