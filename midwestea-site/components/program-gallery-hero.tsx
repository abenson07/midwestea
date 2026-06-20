import clsx from "clsx";

type Props = {
  tagline?: string;
  heading?: string;
  description?: string;
};

export type ProgramGalleryHeroProps = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

export function ProgramGalleryHero(props: ProgramGalleryHeroProps) {
  const {
    tagline = "Career programs",
    heading = "Answer the call",
    description = "Join the ranks of those who run towards the disaster. Arm yourself with the skills you need to help those who need it most.",
    className,
  } = props;

  return (
    <section
      className={clsx(
        "flex min-h-[50vh] items-center justify-center px-[5%] pt-28 md:min-h-[800px] md:pt-0",
        className,
      )}
    >
      <div className="container max-w-4xl text-center">
        <p className="mea-tagline">{tagline}</p>
        <h1 className="mea-heading-h1 mt-4">{heading}</h1>
        <p className="mx-auto mt-4 max-w-lg text-base md:text-md">{description}</p>
      </div>
    </section>
  );
}
