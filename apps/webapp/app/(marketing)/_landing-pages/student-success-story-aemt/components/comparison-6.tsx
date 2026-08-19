import clsx from "clsx";
import type { ButtonProps } from "@relume_io/relume-ui";

type CostRow = {
  label: string;
  midwestEa: string;
  competitor: string;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  competitorName: string;
  baseTuition: { midwestEa: string; competitor: string };
  costRows: CostRow[];
  totalCost: { midwestEa: string; competitor: string };
  button: ButtonProps;
};

export type Comparison6Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Comparison6 = (props: Comparison6Props) => {
  const {
    tagline,
    heading,
    description,
    competitorName,
    baseTuition,
    costRows,
    totalCost,
    button,
  } = {
    ...Comparison6Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mea-tagline mb-3">{tagline}</p>
          <h2 className="mea-heading-h3 mb-5 md:mb-6">{heading}</h2>
          <p className="mea-body-md">{description}</p>
        </div>
        <div className="mx-auto w-full max-w-3xl">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] items-end gap-x-6 pb-6">
            <p className="mea-text-medium-semibold">Base tuition</p>
            <div className="text-center">
              <p className="mea-text-medium-semibold text-xs uppercase text-neutral-darker">
                Midwest EA
              </p>
              <p className="mea-text-medium-semibold text-xl">{baseTuition.midwestEa}</p>
            </div>
            <div className="text-center">
              <p className="mea-text-medium-semibold text-xs uppercase text-neutral-darker">
                {competitorName}
              </p>
              <p className="mea-text-medium-semibold text-xl">{baseTuition.competitor}</p>
            </div>
          </div>
          {costRows.map((row, index) => (
            <div
              key={row.label}
              className={clsx(
                "grid grid-cols-[1.5fr_1fr_1fr] items-center gap-x-6 rounded-mea-xs px-4 py-3",
                { "bg-neutral-lightest": index % 2 === 0 },
              )}
            >
              <p className="mea-body-md">{row.label}</p>
              <p className="mea-body-md text-center">{row.midwestEa}</p>
              <p className="mea-body-md text-center">{row.competitor}</p>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-[1.5fr_1fr_1fr] items-center gap-x-6 pt-4">
            <p className="mea-text-medium-semibold">Total cost</p>
            <p className="mea-heading-h4 text-center">{totalCost.midwestEa}</p>
            <p className="mea-heading-h4 text-center">{totalCost.competitor}</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center md:mt-10">
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
    </section>
  );
};

export const Comparison6Defaults: Props = {
  tagline: "See how we compare",
  heading: "Affordable hands-on training",
  description:
    "Quality EMS training at a fraction of the cost of a college degree. Our programs won't bury you in debt. Plus, we offer flexible payment plans so you can invest in your future without financial strain.",
  competitorName: "Local college program",
  baseTuition: { midwestEa: "$1,800", competitor: "$3,600" },
  costRows: [
    { label: "Books", midwestEa: "$50", competitor: "$300" },
    { label: "Supplies", midwestEa: "Included", competitor: "$500" },
    { label: "Certification fee", midwestEa: "N/A", competitor: "$25" },
    { label: "Materials", midwestEa: "Included", competitor: "$125" },
    { label: "Insurance", midwestEa: "N/A", competitor: "$60" },
  ],
  totalCost: { midwestEa: "$1,850", competitor: "$4,610" },
  button: { title: "Register today to lock in your price" },
};
