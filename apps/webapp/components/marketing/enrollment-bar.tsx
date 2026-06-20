"use client";

import clsx from "clsx";
import { useEnrollmentBarScroll } from "@/hooks/marketing/use-enrollment-bar-scroll";

type EnrollmentBarProps = {
  titleLines: string[];
  variant?: "waitlist" | "register";
  statusPrimary?: string;
  statusSecondary?: string;
  statusNote?: string;
  availabilityLabel?: string;
  waitlistLabel?: string;
  waitlistHref?: string;
  classStartLabel?: string;
  classStartDate?: string;
  priceNote?: string;
  price?: string;
  totalPrice?: string;
  registerLabel?: string;
  registerHref?: string;
  className?: string;
  animateOnHeroScroll?: boolean;
};

export type { EnrollmentBarProps };

export const EnrollmentBar = (props: EnrollmentBarProps) => {
  const {
    titleLines,
    variant = "waitlist",
    statusPrimary = "Coming soon",
    statusSecondary = "Price",
    statusNote = "Check back soon for class updates",
    availabilityLabel,
    waitlistLabel = "Coming soon",
    waitlistHref = "#",
    classStartLabel = "Next class starts",
    classStartDate,
    priceNote = "Get certified today for just",
    price,
    totalPrice,
    registerLabel = "Register",
    registerHref = "#",
    className,
    animateOnHeroScroll = true,
  } = props;
  const barRef = useEnrollmentBarScroll(animateOnHeroScroll);

  return (
    <div ref={barRef} className={clsx("px-[2%] pb-4", className)}>
      <div className="flex w-full flex-col items-start justify-between gap-4 rounded-mea-sm bg-neutral-lightest p-4 shadow-medium sm:flex-row sm:items-center">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="mea-heading-h5 uppercase leading-[1.2]">
            {titleLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>

          {variant === "waitlist" ? (
            <div>
              <div className="flex gap-2 text-sm font-semibold">
                <span>{statusPrimary}</span>
                <span>{statusSecondary}</span>
              </div>
              <p className="text-sm text-neutral-dark">{statusNote}</p>
            </div>
          ) : (
            <div>
              {availabilityLabel ? (
                <>
                  <div className="text-sm font-semibold">{availabilityLabel}</div>
                  {price ? (
                    <p className="text-sm text-neutral-dark">
                      {priceNote} ${price}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="flex gap-2 text-sm font-semibold">
                    <span>{classStartLabel}</span>
                    {classStartDate ? <span>{classStartDate}</span> : null}
                  </div>
                  {price ? (
                    <p className="text-sm text-neutral-dark">
                      {priceNote} ${price}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {variant === "waitlist" ? (
            <span className="inline-flex items-center rounded-mea-xs border border-mea-yellow bg-neutral-lighter px-4 py-2 text-base font-semibold text-text">
              {waitlistLabel}
            </span>
          ) : (
            <>
              {totalPrice ? (
                <p className="mea-heading-h5 font-bold">${totalPrice}</p>
              ) : null}
              <a
                href={registerHref}
                className="mea-button-primary whitespace-nowrap"
                target="_blank"
                rel="noreferrer"
              >
                {registerLabel}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

