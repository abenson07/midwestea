type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  description: string | string[];
  cards: ImageProps[];
};

export type Layout520Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Layout520 = (props: Layout520Props) => {
  const { heading, description, cards } = {
    ...Layout520Defaults,
    ...props,
  };
  const paragraphs = Array.isArray(description) ? description : [description];

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
            <div className="space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="md:text-md">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          {cards.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-mea-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const image = {
  src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
  alt: "Relume placeholder image",
};

export const Layout520Defaults: Props = {
  heading: "Short heading goes here",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  cards: [image, image, image],
};