import clsx from "clsx";

type Props = {
  tagline?: string;
  heading?: string;
  description?: string;
};

export type TrainersProps = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export function Trainers(props: TrainersProps) {
  const {
    tagline = "Kansas City's best instructors",
    heading = "Learn from real responders",
    description = "Kansas City's top EMS professionals bring real experience and field-tested insight to every course.",
    className,
  } = props;

  return (
    <section className={clsx("bg-background", className)}>
      <div className="px-[5%] py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mea-tagline">{tagline}</div>
            <div className="mt-2" />
            <h2 className="mea-heading-h2">{heading}</h2>
            <p className="mea-body-md mx-auto mt-4 max-w-2xl">{description}</p>
          </div>
        </div>
      </div>
      {/* CMS trainer cards were empty in Webflow export — deferred until data source exists */}
    </section>
  );
}
