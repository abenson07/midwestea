import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";
import type { ButtonProps } from "@relume_io/relume-ui";

type QuestionsProps = {
  title: string;
  answer: string;
};

type ContactItemProps = {
  label: string;
  linkText: string;
  href: string;
  body?: string;
};

type Props = {
  heading: string;
  description?: string;
  button: ButtonProps;
  questions: QuestionsProps[];
  questionsHeading?: string;
  contactItems?: ContactItemProps[];
  defaultOpenAll?: boolean;
};

export type Faq6Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

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

export const Faq6 = (props: Faq6Props) => {
  const {
    heading,
    description,
    button,
    questions,
    questionsHeading,
    contactItems,
    defaultOpenAll,
  } = {
    ...Faq6Defaults,
    ...props,
  };
  const defaultOpenValues = defaultOpenAll
    ? questions.map((_, index) => `item-${index}`)
    : undefined;
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container grid grid-cols-1 gap-y-12 lg:grid-cols-[0.75fr_1fr] lg:gap-x-20 lg:gap-y-16">
        <div className="lg:sticky lg:top-[calc(var(--mea-nav-height)+6rem)] lg:pb-[30vh]">
          <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
          {contactItems?.length ? (
            <div className="mt-2 flex flex-col gap-4">
              {contactItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <p className="mea-text-medium-semibold">{item.label}</p>
                  {item.body ? (
                    <p className="mea-body-md">
                      {item.body}{" "}
                      <a href={item.href} className="hover:text-mea-red-darker">
                        {item.linkText}
                      </a>
                    </p>
                  ) : (
                    <a href={item.href} className="mea-body-md hover:text-mea-red-darker">
                      {item.linkText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : description ? (
            <p className="mea-body-md">{description}</p>
          ) : null}
          {button.title ? (
            <div className="mt-6 md:mt-8">
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
          ) : null}
        </div>
        <div className="flex flex-col gap-12">
          {questionsHeading ? (
            <h2 className="mea-heading-h4 m-0 normal-case">{questionsHeading}</h2>
          ) : null}
          <Accordion
            type="multiple"
            defaultValue={defaultOpenValues}
            className="flex flex-col gap-4"
          >
            {questions.map((question, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
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
      </div>
    </section>
  );
};

export const Faq6Defaults: Props = {
  heading: "FAQs",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
  button: {
    title: "Contact",
    variant: "secondary",
  },
  questions: [
    {
      title: "Question text goes here",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Question text goes here",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Question text goes here",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Question text goes here",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Question text goes here",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
  ],
};
