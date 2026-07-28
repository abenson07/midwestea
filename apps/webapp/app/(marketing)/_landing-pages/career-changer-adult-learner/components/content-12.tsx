type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  intro: string;
  gettingStartedHeading: string;
  gettingStartedParagraph: string;
  image: ImageProps;
  imageCaption: string;
  journeyHeading: string;
  journeyParagraph: string;
  quote: string;
  quoteAvatar: ImageProps;
  quoteAuthor: string;
  takeawayHeading: string;
  takeawayParagraphs: string[];
};

export type Content12Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Content12 = (props: Content12Props) => {
  const {
    heading,
    intro,
    gettingStartedHeading,
    gettingStartedParagraph,
    image,
    imageCaption,
    journeyHeading,
    journeyParagraph,
    quote,
    quoteAvatar,
    quoteAuthor,
    takeawayHeading,
    takeawayParagraphs,
  } = {
    ...Content12Defaults,
    ...props,
  };

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto flex max-w-[48rem] flex-col">
          <h2 className="mea-heading-h3 mb-4">{heading}</h2>
          <p className="mea-body-md mb-4">{intro}</p>

          <h3 className="mea-heading-h4 mb-4 mt-6">{gettingStartedHeading}</h3>
          <p className="mea-body-md mb-4">{gettingStartedParagraph}</p>

          <figure className="my-9 flex flex-col gap-2">
            <div className="overflow-hidden rounded-mea-lg">
              <img src={image.src} alt={image.alt} className="aspect-[768/480] w-full object-cover" />
            </div>
            <figcaption className="flex gap-2 text-sm text-neutral-darker">
              <span className="w-0.5 shrink-0 bg-mea-red" aria-hidden />
              {imageCaption}
            </figcaption>
          </figure>

          <h3 className="mea-heading-h4 mb-4 mt-2">{journeyHeading}</h3>
          <p className="mea-body-md mb-4">{journeyParagraph}</p>

          <div className="my-9 flex flex-col gap-6">
            <div className="flex gap-5">
              <span className="w-0.5 shrink-0 bg-mea-red" aria-hidden />
              <p className="mea-body-md text-xl italic">{quote}</p>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={quoteAvatar.src}
                alt={quoteAvatar.alt}
                className="size-6 rounded-full object-cover"
              />
              <p className="mea-text-medium-semibold text-xs">{quoteAuthor}</p>
            </div>
          </div>

          <h3 className="mea-heading-h4 mb-4 mt-2">{takeawayHeading}</h3>
          {takeawayParagraphs.map((paragraph) => (
            <p key={paragraph} className="mea-body-md mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Content12Defaults: Props = {
  heading: "James' story",
  intro:
    "Imagine this: you're 35, working full-time, maybe with kids at home. You've spent a decade or more in another field, but you've always felt the call to emergency medicine – to do something more meaningful. Yet, the thought of dropping everything to go back to school is scary. That's exactly the situation many of our students have faced, and Midwest EMS Academy was built to help people like you.",
  gettingStartedHeading: "Getting started",
  gettingStartedParagraph:
    "James spent 15 years in IT. By his mid-30s, he was successful but unfulfilled. He craved a career where he could help others directly. Still, James had a mortgage, a family, and a 9-to-5 job he couldn't just leave. He chose Midwest EMS Academy's flexible Paramedic program to make his transition possible. During the week, after dinner, James would settle in and watch online lectures or complete interactive assignments at his own pace. Every other Saturday, he attended an in-person lab to practice skills like starting IVs and managing airways with instructors.",
  image: { src: "/images/group-care.avif", alt: "Students attending a hands-on training session" },
  imageCaption:
    "Midwest EMS Academy students attending a hands-on training session as part of a flexible hybrid program.",
  journeyHeading: "His journey",
  journeyParagraph:
    "Was it easy? Not always. James had long days – work in the morning, classwork at night – and some weekends where he was mastering patient assessment instead of relaxing. But with the support of his family and Midwest EMS Academy's staff, he made steady progress. 18 months later, James graduated as a certified Paramedic. He kept his day job until the very week he landed a paramedic position with a local ambulance service. Now he's 37 and starting a job he loves, without having sacrificed his financial security to get here.",
  quote: "Midwest EMS Academy gave me a second chance at my dream. If I can do it, anyone can.",
  quoteAvatar: { src: "/images/instructors/Jonathan.jpg", alt: "James Doe" },
  quoteAuthor: "James Doe, Paramedic",
  takeawayHeading: "The takeaway",
  takeawayParagraphs: [
    "Maybe your story will be different – perhaps you'll train to be an EMT first (a shorter program) and get a foot in the door that way. Or maybe you're switching from the military or firefighting into EMS and already have some related skills. Whatever your background, if you're passionate about saving lives, we're here to help you do it. We've had students from age 18 to 60 in our classes. Your life experience is an asset in this field.",
    "The bottom line: It's never too late to pursue a career you truly care about. Midwest EMS Academy will work with you to make it happen. Keep your paycheck, keep your commitments, and train for a life-changing new role on your terms. We'll make sure the journey fits your life – and leads you to success.",
  ],
};
