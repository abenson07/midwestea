import type { ButtonProps } from "@relume_io/relume-ui";

type Props = {
  title: string;
  description: string;
  button: ButtonProps;
};

export type Header108CProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header108C = (props: Header108CProps) => {
  const { title, description, button } = {
    ...Header108CDefaults,
    ...props,
  };

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2 className="mea-heading-h2 mb-5 md:mb-6">{title}</h2>
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
    </section>
  );
};

export const Header108CDefaults: Props = {
  title: "Your next career starts here.",
  description: "Join the working adults who've already made the change into EMS.",
  button: { title: "Request program info" },
};
