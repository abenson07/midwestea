"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";
import Link from "next/link";

function scrollToCategory(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
}

type FaqQuestion = {
  title: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  title: string;
  questions: FaqQuestion[];
};

type NavLink = {
  label: string;
  href: string;
};

type FaqHeroProps = {
  heading: string;
  description: string;
  navLinks: NavLink[];
  button?: {
    title: string;
    url: string;
  };
  categories: FaqCategory[];
};

export type FaqHeroComponentProps = React.ComponentPropsWithoutRef<"section"> &
  Partial<FaqHeroProps>;

const FaqHeroDefaults: FaqHeroProps = {
  heading: "Questions?",
  description: "Looking for something specific?",
  navLinks: [],
  categories: [],
};

function FaqPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M25.3333 15.667V16.3336C25.3333 16.7018 25.0349 17.0003 24.6667 17.0003H17V24.667C17 25.0351 16.7015 25.3336 16.3333 25.3336H15.6667C15.2985 25.3336 15 25.0351 15 24.667V17.0003H7.3333C6.96511 17.0003 6.66663 16.7018 6.66663 16.3336V15.667C6.66663 15.2988 6.96511 15.0003 7.3333 15.0003H15V7.33365C15 6.96546 15.2985 6.66699 15.6667 6.66699H16.3333C16.7015 6.66699 17 6.96546 17 7.33365V15.0003H24.6667C25.0349 15.0003 25.3333 15.2988 25.3333 15.667Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FaqHero(props: FaqHeroComponentProps) {
  const { heading, description, navLinks, button, categories } = {
    ...FaqHeroDefaults,
    ...props,
  };
  return (
    <section className="bg-background px-[5%] pb-16 pt-20 md:pb-24 md:pt-24 lg:pb-28 lg:pt-28">
      <div className="container grid grid-cols-1 gap-y-12 lg:grid-cols-[0.5fr_1fr] lg:gap-x-20 lg:gap-y-16">
        <div className="lg:sticky lg:top-[calc(var(--mea-nav-height)+6rem)] lg:pb-[30vh]">
          <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
          <div className="mt-2 flex flex-col gap-0.5">
            <p className="mea-text-medium-semibold">{description}</p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mea-body-md hover:text-mea-red-darker"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToCategory(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
          {button?.title ? (
            <div className="mt-6 md:mt-8">
              <Link href={button.url} className="mea-button-secondary">
                {button.title}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-12">
          {categories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="flex scroll-mt-32 flex-col gap-4"
            >
              <h2 className="mea-heading-h4 m-0 normal-case">{category.title}</h2>
              <Accordion type="multiple" className="flex flex-col gap-4">
                {category.questions.map((question, index) => (
                  <AccordionItem
                    key={`${category.id}-${index}`}
                    value={`${category.id}-item-${index}`}
                    className="overflow-hidden rounded-mea-lg border-none bg-neutral-lightest shadow-small"
                  >
                    <AccordionTrigger
                      icon={
                        <span className="flex w-8 shrink-0 self-start">
                          <FaqPlusIcon className="size-8 transition-transform duration-300" />
                        </span>
                      }
                      className="mea-text-medium-semibold flex w-full flex-1 cursor-pointer items-center justify-between gap-6 px-5 py-5 text-left md:px-6 [&[data-state=open]_svg]:rotate-45"
                    >
                      {question.title}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 text-base leading-normal md:px-6">
                      {question.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
