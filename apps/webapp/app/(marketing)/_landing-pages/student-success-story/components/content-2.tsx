type ImageProps = {
  src: string;
  alt?: string;
};

type Props = {
  heading: string;
  image: ImageProps;
  children: React.ReactNode;
};

export type Content2Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Content2 = (props: Content2Props) => {
  const { heading, children, image } = {
    ...Content2Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-2 md:gap-x-12 lg:gap-x-20">
          <div>
            <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
            <div className="flex flex-col gap-4">{children}</div>
          </div>
          <div className="rounded-mea-lg overflow-hidden">
            <img src={image.src} className="w-full object-cover" alt={image.alt} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Content2Defaults: Props = {
  heading: "Greg's story",
  children: (
    <>
      <p className="mea-body-md">
        Greg always knew he wanted a career helping others, but the prospect of spending four
        years in college (and taking on a mountain of debt) just didn&apos;t feel right.{" "}
        <strong>&ldquo;I didn&apos;t want to spend years in a classroom before actually
        saving lives,&rdquo;</strong> Greg says. After high school, he took a leap and enrolled in
        Midwest EMS Academy&apos;s 12-week EMT program. It turned out to be the best decision of
        his life.
      </p>
      <p className="mea-body-md">
        From day one, Greg was immersed in real training. He wasn&apos;t sitting in a huge lecture
        hall learning abstract theory; he was in a small, hands-on class practicing how to stop
        bleeding, perform CPR, and manage real emergency scenarios.{" "}
        <strong>The instructors knew him by name</strong> and took extra time to make sure he
        grasped each skill. &ldquo;It was so engaging. I learned more in three months here than I
        think I would have in two years of general college classes,&rdquo; he recalls.
      </p>
      <p className="mea-body-md">
        When the 12 weeks were up, Greg had earned his EMT certification. He studied hard and,
        with Midwest EMS Academy&apos;s preparation,{" "}
        <strong>passed the NREMT exam on his first attempt</strong>. Just a few weeks later —
        while some of his high school friends were still picking college majors — Greg started his
        new job as a full-time EMT with a local ambulance service. He was 19 years old, out in the
        real world, <strong>making a difference every day</strong>.
      </p>
      <p className="mea-body-md">
        That was a year ago. Now Greg has responded to dozens of 911 calls, from helping car crash
        victims to reviving heart attack patients. &ldquo;I love my job and I&apos;m proud of the
        path I chose,&rdquo; he says. &ldquo;Midwest EMS Academy gave me the head start I needed.
        Instead of sitting in a dorm room, I&apos;m out here doing what I was meant to do.&rdquo;
      </p>
      <p className="mea-body-md">
        Greg&apos;s story is proof that college isn&apos;t the only path to success. His advice to
        others: &ldquo;If you&apos;re serious about EMS, don&apos;t wait four years to start. Do
        it now.&rdquo;
      </p>
    </>
  ),
  image: {
    src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
    alt: "Greg on an ambulance call",
  },
};
