import Link from "next/link";

type PolicyItem = {
  title: string;
  category: string;
  url: string;
};

type Props = {
  heading: string;
  description: string;
  email: string;
  policies: PolicyItem[];
};

export type PoliciesListProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const PoliciesList = (props: PoliciesListProps) => {
  const { heading, description, email, policies } = {
    ...PoliciesListDefaults,
    ...props,
  };

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container grid grid-cols-1 gap-y-12 lg:grid-cols-[0.75fr_1fr] lg:gap-x-20">
        <div className="lg:sticky lg:top-[calc(var(--mea-nav-height)+6rem)] lg:pb-[30vh]">
          <h2 className="mea-heading-h2 mb-5 md:mb-6">{heading}</h2>
          <div className="flex flex-col gap-2">
            <p className="mea-text-medium-semibold">{description}</p>
            <a href={`mailto:${email}`} className="mea-body-md text-text no-underline hover:underline">
              {email}
            </a>
          </div>
        </div>
        <div className="flex flex-col">
          {policies.map((policy) => (
            <Link
              key={policy.url}
              href={policy.url}
              prefetch={false}
              className="flex flex-col gap-0.5 border-none py-4 text-text no-underline transition-opacity hover:opacity-80"
            >
              <p className="m-0 font-body text-sm leading-[1.4] opacity-60">{policy.category}</p>
              <h4 className="mea-heading-h4 m-0 normal-case">{policy.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const PoliciesListDefaults: Props = {
  heading: "Policies",
  description: "Need clarification?",
  email: "hello@midwestea.com",
  policies: [],
};
