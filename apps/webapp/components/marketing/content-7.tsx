import clsx from "clsx";

type Props = {
  heading?: string;
  children: React.ReactNode;
  noTopPadding?: boolean;
};

export type Content7Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Content7 = (props: Content7Props) => {
  const {
    heading,
    children = Content7Defaults.children,
    noTopPadding = false,
    className,
    ...rest
  } = props;
  return (
    <section
      id="relume"
      className={clsx(
        "px-[5%] pb-16 md:pb-24 lg:pb-28",
        noTopPadding ? "pt-0" : "pt-16 md:pt-24 lg:pt-28",
        className,
      )}
      {...rest}
    >
      <div className="container">
        <div className="mx-auto w-full max-w-lg">
          {heading ? (
            <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
          ) : null}
          <div className="prose">{children}</div>
        </div>
      </div>
    </section>
  );
};

export const Content7Defaults: Props = {
  children: (
    <div>
      <p>
        Morbi sed imperdiet in ipsum, adipiscing elit dui lectus. Tellus id scelerisque est
        ultricies ultricies. Duis est sit sed leo nisl, blandit elit sagittis. Quisque tristique
        consequat quam sed. Nisl at scelerisque amet nulla purus habitasse.
      </p>
      <p>
        Nunc sed faucibus bibendum feugiat sed interdum. Ipsum egestas condimentum mi massa. In
        tincidunt pharetra consectetur sed duis facilisis metus. Etiam egestas in nec sed et. Quis
        lobortis at sit dictum eget nibh tortor commodo cursus.
      </p>
      <p>
        Odio felis sagittis, morbi feugiat tortor vitae feugiat fusce aliquet. Nam elementum urna
        nisi aliquet erat dolor enim. Ornare id morbi eget ipsum. Aliquam senectus neque ut id eget
        consectetur dictum. Donec posuere pharetra odio consequat scelerisque et, nunc tortor. Nulla
        adipiscing erat a erat. Condimentum lorem posuere gravida enim posuere cursus diam.
      </p>
    </div>
  ),
};