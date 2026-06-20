"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@relume_io/relume-ui";
import type { ButtonProps } from "@relume_io/relume-ui";
import {
  BiAward,
  BiCheck,
  BiHourglass,
  BiSolidStar,
  BiSolidStarHalf,
  BiStar,
  BiTimeFive,
  BiUser,
} from "react-icons/bi";
import clsx from "clsx";

type ImageProps = {
  src: string;
  alt?: string;
};

type BreadcrumbProps = {
  url: string;
  title: string;
};

type GalleryProps = {
  images: ImageProps[];
};

type QuestionsProps = {
  title: string;
  answer: string;
  items?: string[];
};

type RatingProps = {
  review: number;
  starsNumber: number;
};

type SelectVariant = {
  value: string;
  label: string;
};

type OptionProps = ButtonProps & {
  url: string;
};

export type CourseHeaderContent = {
  registerUrl: string;
  registerPrice: string;
  classDetails: { label: string }[];
  testimonial: { quote: string; attribution: string };
  credentials: string[];
  sections: { title: string; items: string[] }[];
};

type Props = {
  breadcrumbs: BreadcrumbProps[];
  heading: string;
  images: ImageProps[];
  description: string;
  price: string;
  rating: RatingProps;
  buttons: ButtonProps[];
  options: OptionProps[];
  quantityInputPlaceholder: string;
  freeShipping: string;
  questions: QuestionsProps[];
  selectVariants: SelectVariant[];
  /** When true, hero extends under the fixed nav/banner. */
  overlayNav?: boolean;
  /** Course detail content (register CTA, class details, etc.). Independent of overlayNav. */
  courseHeader?: CourseHeaderContent;
};

export type ProductHeader6Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

const CLASS_DETAIL_ICONS = [BiUser, BiHourglass, BiTimeFive, BiAward] as const;

export const ProductHeader6 = (props: ProductHeader6Props) => {
  const {
    breadcrumbs,
    heading,
    images,
    price,
    description,
    rating,
    buttons,
    options,
    quantityInputPlaceholder,
    freeShipping,
    questions,
    selectVariants,
    overlayNav = false,
    courseHeader,
  } = {
    ...ProductHeader6Defaults,
    ...props,
  };
  const [variantInput, setVariantInput] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      variantInput,
      optionInput,
      quantityInput,
    });
  };

  const isCourseHeader = Boolean(courseHeader);

  return (
    <header id="relume" data-course-hero={isCourseHeader ? "" : undefined}>
      <div
        className={clsx(
          "grid grid-cols-1",
          isCourseHeader ? "lg:grid-cols-[1.75fr_1fr]" : "lg:grid-cols-2",
        )}
      >
        <Gallery images={images} overlayNav={overlayNav} />
        <div>
          <div
            className={clsx(
              "px-[5%] pb-20 lg:pl-20 lg:pr-[5vw] lg:pb-20",
              overlayNav ? "mea-pt-below-nav" : "pt-8 md:pt-12 lg:sticky lg:top-0",
            )}
          >
            <div className={clsx(isCourseHeader ? "max-w-xl" : "lg:max-w-md")}>
              {isCourseHeader && courseHeader ? (
                <CourseHeaderPanel
                  heading={heading}
                  description={description}
                  courseHeader={courseHeader}
                />
              ) : (
                <>
                  <Breadcrumb className="mb-6 flex flex-wrap items-center text-sm">
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                  <div>
                    <h1 className="mea-heading-h3 mb-2">{heading}</h1>
                    <p className="mb-5 text-xl font-bold md:mb-6 md:text-2xl">{price}</p>
                    <div className="mb-5 flex flex-wrap items-center gap-3 md:mb-6">
                      <Star rating={rating.starsNumber} />
                      <p className="text-sm">{`(${rating.starsNumber} stars) • ${rating.review} reviews`}</p>
                    </div>
                    <p className="mb-5 md:mb-6">{description}</p>
                    <form onSubmit={handleSubmit} className="mb-8">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col">
                          <Label className="mb-2">Variant</Label>
                          <Select onValueChange={setVariantInput}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectVariants.map((item, index) => (
                                <SelectItem key={index} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col">
                          <Label className="mb-2">Variant</Label>
                          <div className="flex flex-wrap gap-4">
                            {options.map((option, index) => (
                              <Button
                                key={index}
                                className="px-4 py-2"
                                asChild
                                onClick={() => setOptionInput(option.title || "")}
                                {...option}
                              >
                                <a
                                  href={option.url}
                                  className={clsx({
                                    "pointer-events-none opacity-25": option.disabled,
                                  })}
                                >
                                  {option.title}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor="quantity" className="mb-2">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            id="quantity"
                            placeholder={quantityInputPlaceholder}
                            className="w-16"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-4 mt-8 flex flex-col gap-y-4">
                        {buttons.map((button, index) => (
                          <Button key={index} {...button}>
                            {button.title}
                          </Button>
                        ))}
                      </div>
                      <p className="text-center text-xs">{freeShipping}</p>
                    </form>
                    <Accordion type="multiple">
                      {questions.map((question, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="mea-text-medium-semibold py-4 [&_svg]:size-6">
                            {question.title}
                          </AccordionTrigger>
                          <AccordionContent className="md:pb-6">{question.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

function CourseHeaderPanel({
  heading,
  description,
  courseHeader,
}: {
  heading: string;
  description: string;
  courseHeader: CourseHeaderContent;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="mea-heading-h2">{heading}</h1>
      <p className="text-base leading-relaxed">{description}</p>

      <a
        href={courseHeader.registerUrl}
        target="_blank"
        rel="noreferrer"
        className="mb-2 mt-2 flex w-full items-center justify-center rounded-mea-sm bg-mea-yellow px-6 py-4 text-lg font-bold uppercase text-text transition-opacity hover:opacity-90"
      >
        Register for ${courseHeader.registerPrice}
      </a>

      <div className="flex flex-col gap-4 border-y border-border-primary py-4">
        <p className="text-base font-semibold">Class details</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {courseHeader.classDetails.map((detail, index) => {
            const Icon = CLASS_DETAIL_ICONS[index % CLASS_DETAIL_ICONS.length];
            return (
              <div key={detail.label} className="flex items-center gap-4">
                <Icon className="size-4 shrink-0" aria-hidden />
                <span>{detail.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4 rounded-mea-sm bg-neutral-lightest p-4 shadow-sm">
          <p className="leading-relaxed">&ldquo;{courseHeader.testimonial.quote}&rdquo;</p>
          <p className="text-sm text-neutral-dark">{courseHeader.testimonial.attribution}</p>
        </div>

        <ul className="flex flex-col gap-4">
          {courseHeader.credentials.map((credential) => (
            <li key={credential} className="flex items-start gap-4">
              <BiCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="text-sm leading-relaxed">{credential}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-border-primary">
        <Accordion type="multiple" className="w-full">
          {courseHeader.sections.map((section, index) => (
            <AccordionItem
              key={section.title}
              value={`course-section-${index}`}
              className="border-t border-border-primary"
            >
              <AccordionTrigger className="mea-text-medium-semibold py-4 [&_svg]:size-6">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

const Star = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFullStar = i < fullStars;
        const isHalfStar = hasHalfStar && i === fullStars;

        return (
          <div key={i}>
            {isFullStar ? <BiSolidStar /> : isHalfStar ? <BiSolidStarHalf /> : <BiStar />}
          </div>
        );
      })}
    </div>
  );
};

const Gallery = ({ images, overlayNav }: GalleryProps & { overlayNav?: boolean }) => {
  return (
    <React.Fragment>
      <div
        className={clsx("relative block w-full lg:hidden", overlayNav ? "h-[70vh]" : "pt-[120%]")}
      >
        <img
          src={images[0].src}
          alt={images[0].alt}
          className={clsx(
            "inset-0 size-full object-cover",
            overlayNav ? "absolute h-full" : "absolute",
          )}
        />
      </div>
      <div className="relative hidden w-full lg:block">
        <div
          className={clsx(
            "sticky top-0",
            overlayNav ? "h-screen max-h-none" : "lg:h-screen lg:max-h-[60rem]",
          )}
        >
          <img
            src={images[0].src}
            alt={images[0].alt}
            className="size-full object-cover"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export const ProductHeader6Defaults: Props = {
  breadcrumbs: [
    { url: "#", title: "Shop all" },
    { url: "#", title: "Category" },
    { url: "#", title: "Product name" },
  ],
  heading: "Product name",
  price: "$55",
  rating: {
    review: 10,
    starsNumber: 3.5,
  },
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  selectVariants: [
    { value: "first-choice", label: "Option One" },
    { value: "second-choice", label: "Option Two" },
    { value: "third-choice", label: "Option Three" },
  ],
  images: [
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 1",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 2",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 3",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 4",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 5",
    },
  ],
  buttons: [{ title: "Add to cart" }, { title: "Buy now", variant: "secondary" }],
  options: [
    {
      title: "Option one",
      url: "#",
    },
    { title: "Option two", url: "#", variant: "secondary" },
    { title: "Option three", url: "#", variant: "secondary", disabled: true },
  ],
  quantityInputPlaceholder: "1",
  freeShipping: "Free shipping over $50",
  questions: [
    {
      title: "Details",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Shipping",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Returns",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
  ],
};
