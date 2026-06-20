import React from "react";

type ImageProps = {
  src: string;
  alt?: string;
};

type ProductProps = {
  image: ImageProps;
  name: string;
  /** Pill tag shown below the image (class-grid layout). */
  tag?: string;
  /** @deprecated Use `tag` for course gallery cards. */
  description?: string;
  price: string;
  url: string;
};

type Props = {
  products: ProductProps[];
  layout?: "default" | "class-grid";
};

export type Product1Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

function OnlineCourseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="size-4 shrink-0"
    >
      <path
        d="M9.125 8.46094C9.20185 8.44007 9.2935 8.44271 9.40039 8.47266V8.47363L15.0303 10.25C15.1054 10.2798 15.1652 10.3213 15.21 10.374C15.2541 10.4261 15.2764 10.4887 15.2764 10.5625C15.2763 10.6159 15.2656 10.6636 15.2451 10.7061L15.2217 10.7471C15.1854 10.7991 15.1295 10.8404 15.0537 10.8701L13.0947 11.5635L13.0576 11.5762L13.085 11.6045L16.5537 15.0732C16.6906 15.2104 16.7588 15.3714 16.7588 15.5576C16.7588 15.7438 16.6906 15.9049 16.5537 16.042L16.1191 16.4766C15.9822 16.6135 15.8222 16.6802 15.6377 16.6787C15.499 16.6775 15.3735 16.64 15.2617 16.5645L15.1553 16.4766L11.666 12.9873L11.6367 12.959L11.624 12.9971L11.0352 14.8008C11.0054 14.8798 10.9634 14.9398 10.9092 14.9814C10.8553 15.0229 10.7933 15.0429 10.7227 15.043C10.6519 15.043 10.5871 15.0225 10.5273 14.9805C10.4831 14.9493 10.4478 14.9081 10.4219 14.8564L10.3994 14.8018L8.76465 9.08496C8.73454 8.98133 8.73121 8.88837 8.75391 8.80566C8.77665 8.72294 8.82394 8.65049 8.89648 8.58789C8.97024 8.52451 9.04639 8.48231 9.125 8.46094ZM5.86719 12.5664C5.99386 12.5664 6.10437 12.5975 6.19922 12.6592L6.28906 12.7314C6.39818 12.8441 6.45307 12.9838 6.45312 13.1523C6.45312 13.3209 6.39604 13.4614 6.2832 13.5742L5.28418 14.5732C5.17137 14.6829 5.03111 14.7396 4.8623 14.7412C4.69371 14.7428 4.55561 14.6867 4.44629 14.5742C4.3335 14.4614 4.27772 14.3221 4.2793 14.1553C4.2809 13.9882 4.33668 13.8492 4.44629 13.7363L5.44531 12.7305C5.55805 12.6211 5.69852 12.5664 5.86719 12.5664ZM3.12012 8.8916H4.49023C4.67107 8.89169 4.82081 8.95047 4.94043 9.06836C5.0597 9.18615 5.12002 9.33631 5.12012 9.52051C5.12012 9.65895 5.08594 9.77827 5.01953 9.87891L4.94238 9.97363C4.82457 10.0913 4.67454 10.1503 4.49023 10.1504H3.12012C2.93924 10.1504 2.78958 10.0914 2.66992 9.97363C2.5504 9.85571 2.49023 9.70502 2.49023 9.52051C2.49033 9.33616 2.54928 9.18615 2.66699 9.06836C2.78489 8.95059 2.93564 8.8916 3.12012 8.8916ZM4.86523 4.23633C5.03176 4.23642 5.17046 4.29269 5.2832 4.40527L6.28809 5.4043V5.40527C6.39768 5.51806 6.45312 5.65833 6.45312 5.82715C6.45304 5.9958 6.39816 6.13394 6.28906 6.24316C6.17636 6.35586 6.0354 6.413 5.86523 6.41309C5.69475 6.41309 5.55564 6.3557 5.44629 6.24316L4.44629 5.24316C4.33669 5.13033 4.28091 4.99014 4.2793 4.82129C4.27779 4.65282 4.33362 4.51306 4.44629 4.40039L4.44531 4.39941C4.55805 4.29011 4.69826 4.23633 4.86523 4.23633ZM14.5938 4.23828C14.7622 4.23997 14.9019 4.2976 15.0146 4.41016C15.1243 4.52304 15.1797 4.66181 15.1797 4.82715C15.1796 4.99225 15.1226 5.13032 15.0098 5.24316L14.0098 6.24316C13.897 6.35591 13.7574 6.41307 13.5889 6.41309C13.4201 6.41309 13.2823 6.35575 13.1729 6.24316H13.1719C13.0594 6.13384 13.003 5.99571 13.0029 5.82715C13.0029 5.65861 13.0591 5.51809 13.1719 5.40527L14.1719 4.40527C14.2846 4.2925 14.4252 4.23668 14.5938 4.23828ZM9.72754 2.4707C9.91212 2.4707 10.0628 2.52961 10.1807 2.64746C10.2984 2.76536 10.3574 2.9161 10.3574 3.10059V4.4707C10.3573 4.65154 10.2985 4.80128 10.1807 4.9209C10.0628 5.0403 9.91196 5.10059 9.72754 5.10059C9.58932 5.10052 9.47063 5.06631 9.37012 5L9.27539 4.92285C9.15771 4.80503 9.09872 4.65501 9.09863 4.4707V3.10059C9.09863 2.91968 9.15756 2.77006 9.27539 2.65039C9.39322 2.53096 9.54322 2.4708 9.72754 2.4707Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.05"
      />
    </svg>
  );
}

function CourseTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-mea-sm border border-neutral-lightest bg-neutral-lightest px-3 py-1 text-xs font-semibold text-text">
      <OnlineCourseIcon />
      <span>{label}</span>
    </span>
  );
}

export const Product1 = (props: Product1Props) => {
  const { products, layout = "default" } = {
    ...Product1Defaults,
    ...props,
  };

  const isClassGrid = layout === "class-grid";

  return (
    <section id="relume" className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div
          className={
            isClassGrid
              ? "grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
              : "grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-16 lg:grid-cols-4"
          }
        >
          {products.map((product, index) => (
            <Product key={index} {...product} layout={layout} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Product = ({
  layout = "default",
  ...product
}: ProductProps & { layout?: "default" | "class-grid" }) => {
  const tag = product.tag ?? product.description;

  if (layout === "class-grid") {
    return (
      <a href={product.url} className="block w-full text-inherit no-underline">
        <div className="mb-3 overflow-hidden rounded-mea-xs md:mb-4">
          <img
            src={product.image.src}
            alt={product.image.alt ?? ""}
            className="aspect-[4/5] size-full object-cover"
          />
        </div>
        {tag ? (
          <div className="mb-3">
            <CourseTag label={tag} />
          </div>
        ) : null}
        <h2 className="mea-heading-h4-card mb-2">{product.name}</h2>
        {product.price ? (
          <p className="text-base font-semibold md:text-md">{product.price}</p>
        ) : null}
      </a>
    );
  }

  return (
    <a href={product.url}>
      <div className="mb-3 md:mb-4">
        <img
          src={product.image.src}
          alt={product.image.alt}
          className="aspect-[10/12] size-full object-cover"
        />
      </div>
      <div className="mb-2">
        <p className="font-semibold md:text-md">{product.name}</p>
        {product.description ? <p className="text-sm">{product.description}</p> : null}
      </div>
      <p className="text-md font-semibold md:text-lg">{product.price}</p>
    </a>
  );
};

export const Product1Defaults: Props = {
  layout: "default",
  products: [
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 1",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 2",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 3",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 4",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 5",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 6",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 7",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
    {
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
        alt: "Relume placeholder image 8",
      },
      name: "Product name",
      description: "Variant",
      price: "$55",
      url: "#",
    },
  ],
};
