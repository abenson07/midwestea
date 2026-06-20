type PaymentStep = {
  label: string;
  amount: string;
  note: string;
  emphasized?: boolean;
};

type CostLineItem = {
  label: string;
  cost: string;
};

type BreakdownCardProps = {
  variant: "included" | "excluded";
  title: string;
  description: string;
  items: CostLineItem[];
  footerLabel: string;
  footerAmount: string;
};

type Props = {
  heading: string;
  intro: string;
  payments: PaymentStep[];
  included: Omit<BreakdownCardProps, "variant">;
  excluded: Omit<BreakdownCardProps, "variant">;
};

export type ParamedicPricingProps = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

function BreakdownCard({
  variant,
  title,
  description,
  items,
  footerLabel,
  footerAmount,
}: BreakdownCardProps) {
  const isDark = variant === "included";

  return (
    <article
      className={
        isDark
          ? "flex h-full flex-col gap-6 rounded-mea-md bg-neutral-darkest p-6 text-text-alternative"
          : "flex h-full flex-col gap-6 rounded-mea-md bg-neutral-lightest p-6 text-text"
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h4 className="mea-heading-h4-card">{title}</h4>
          <p className={isDark ? "mea-body-md text-text-alternative/65" : "mea-body-md"}>
            {description}
          </p>
        </div>

        <div className={isDark ? "h-px bg-text-alternative/30" : "h-px bg-neutral-darkest/30"} />

        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-3 text-xs leading-[1.4]">
              <span className="min-w-0 flex-1">{item.label}</span>
              <span className={isDark ? "shrink-0 text-text-alternative/65" : "shrink-0 text-neutral-darker"}>
                {item.cost}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <div className={isDark ? "h-px bg-text-alternative/30" : "h-px bg-neutral-darkest/30"} />
        <p
          className={
            isDark
              ? "text-[10px] uppercase tracking-[0.1em] text-text-alternative/65"
              : "text-[10px] uppercase tracking-[0.1em] text-neutral-darker"
          }
        >
          {footerLabel}
        </p>
        <h6 className="mea-heading-h6">{footerAmount}</h6>
      </div>
    </article>
  );
}

export const ParamedicPricing = (props: ParamedicPricingProps) => {
  const { heading, intro, payments, included, excluded } = {
    ...ParamedicPricingDefaults,
    ...props,
  };

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-8">
          <div className="flex max-w-none flex-col gap-6 lg:max-w-[26rem]">
            <h3 className="mea-heading-h3 uppercase">{heading}</h3>

            <div className="flex flex-col gap-4">
              <p className="mea-body-md text-neutral-darker">{intro}</p>

              <ul className="flex flex-col gap-4">
                {payments.map((payment) => (
                  <li key={payment.label} className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 text-[13px] leading-[1.4]">
                      <span className={payment.emphasized ? "font-semibold" : undefined}>{payment.label}</span>
                      <span>{payment.amount}</span>
                    </div>
                    <p className="text-[11px] leading-[1.4] text-neutral-darker">{payment.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <BreakdownCard variant="included" {...included} />
          <BreakdownCard variant="excluded" {...excluded} />
        </div>
      </div>
    </section>
  );
};

export const ParamedicPricingDefaults: Props = {
  heading: "Three easy payments",
  intro:
    "Split your program cost into three simple payments — register today and pay the rest on a schedule that works around your class dates.",
  payments: [
    {
      label: "Due Today:",
      amount: "$50 registration fee",
      note: "Due right now at enrollment, non-refundable",
      emphasized: true,
    },
    {
      label: "Payment 1:",
      amount: "$1,000",
      note: "Due 3 days before class starts",
    },
    {
      label: "Payment 2:",
      amount: "$1,000",
      note: "Due 2 weeks after class starts",
    },
  ],
  included: {
    title: "What's Included",
    description: "Paramedic Program cost breakdown — everything covered in your tuition.",
    items: [
      { label: "Textbooks & Learning Materials", cost: "$950.95" },
      { label: "Platinum Ed Testing", cost: "$105.00" },
      { label: "Platinum Ed Planner", cost: "$95.00" },
      { label: "Paramedic Program Polo", cost: "$50.00" },
      { label: "Background Check & Clinical Student Access", cost: "$130.00" },
      { label: "Student ID Card", cost: "$20.00" },
      { label: "Tuition", cost: "$7,449.05" },
    ],
    footerLabel: "Total program cost",
    footerAmount: "$8,800.00",
  },
  excluded: {
    title: "What's Not Included",
    description: "Personal gear purchased separately before clinical rotations.",
    items: [
      { label: "EMS Duty Pants", cost: "$40 – $80" },
      { label: "Boots", cost: "$80 – $150" },
      { label: "Trauma Shears", cost: "$10 – $25" },
      { label: "Stethoscope", cost: "$40 – $150" },
      { label: "Other Required/Recommended Personal Gear", cost: "$50 – $150" },
    ],
    footerLabel: "Est. additional cost",
    footerAmount: "$220 – $555",
  },
};
