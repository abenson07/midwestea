"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RxChevronDown } from "react-icons/rx";
import { MidwestEALogo } from "@/components/marketing/midwestea-logo";
import { RotatingEnrollmentBanner } from "@/components/marketing/rotating-enrollment-banner";
import {
  courseLinkColumns,
  courseLinkColumnsNarrow,
  courseLinks,
  navTestimonial,
  programLinkColumns,
  programLinks,
} from "@/lib/marketing/nav-data";
import { useScrollHideNav } from "@/hooks/marketing/use-scroll-hide-nav";
import type { BannerEnrollmentItem } from "@/lib/marketing/banner-enrollment";

type DropdownId = "programs" | "courses" | null;

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HowItWorksCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col justify-between gap-4 rounded-mea-sm bg-neutral-lightest p-6 text-text transition-opacity hover:opacity-90"
    >
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-neutral-dark">{subtitle}</div>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold">
        See how it works
        <ChevronRight />
      </div>
    </Link>
  );
}

function TestimonialCard() {
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-mea-sm bg-neutral-lightest p-6 text-text">
      <p className="text-xs leading-relaxed">&ldquo;{navTestimonial.quote}&rdquo;</p>
      <p className="text-xs font-semibold">{navTestimonial.attribution}</p>
    </div>
  );
}

function MobileNavSection({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  onNavigate: () => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mea-heading-h4 mb-4 uppercase">{title}</h2>
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block py-1.5 text-sm font-semibold hover:text-mea-red-darker"
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileMenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain px-[5vw] pb-8">
      <MobileNavSection title="Programs" links={programLinks} onNavigate={onClose} />
      <MobileNavSection title="Courses" links={courseLinks} onNavigate={onClose} />
      <Link
        href="/faq"
        className="mea-heading-h4 block uppercase hover:text-mea-red-darker"
        onClick={onClose}
      >
        FAQ
      </Link>
    </div>
  );
}

function MegaMenuLinkList({
  columns,
}: {
  columns: ReadonlyArray<ReadonlyArray<{ label: string; href: string }>>;
}) {
  return (
    <>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="min-w-0 flex flex-col gap-0.5">
          {column.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="break-words px-2 py-2 text-sm font-semibold leading-snug hover:text-mea-red-darker"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
}

function MegaMenuPanel({
  howItWorksHref,
  columns,
  narrowColumns,
}: {
  howItWorksHref: string;
  columns: ReadonlyArray<ReadonlyArray<{ label: string; href: string }>>;
  narrowColumns?: ReadonlyArray<ReadonlyArray<{ label: string; href: string }>>;
}) {
  const linkColumns = narrowColumns ?? columns;

  return (
    <div className="grid w-full min-w-0 items-stretch grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] min-[1100px]:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)_minmax(13.75rem,17.5rem)]">
      <div className="shrink-0 p-6 xl:p-8">
        <HowItWorksCard
          href={howItWorksHref}
          title="Not sure where to start?"
          subtitle="From registration to certification, we've got your back."
        />
      </div>

      <div className="min-w-0 py-6 pr-6 xl:py-8 xl:pr-8">
        {narrowColumns ? (
          <>
            <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-2 xl:hidden">
              <MegaMenuLinkList columns={linkColumns} />
            </div>
            <div className="hidden min-w-0 grid-cols-3 gap-x-8 gap-y-2 xl:grid">
              <MegaMenuLinkList columns={columns} />
            </div>
          </>
        ) : (
          <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-2 xl:gap-x-8">
            <MegaMenuLinkList columns={columns} />
          </div>
        )}
      </div>

      <div className="hidden min-[1100px]:block shrink-0 p-6 xl:p-8">
        <TestimonialCard />
      </div>
    </div>
  );
}

export function Navigation({ bannerItems = [] }: { bannerItems?: BannerEnrollmentItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [mobilePanelHeight, setMobilePanelHeight] = useState(0);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const navRef = useScrollHideNav(!mobileOpen);

  useLayoutEffect(() => {
    if (!mobileOpen) {
      setMobilePanelHeight(0);
      return;
    }

    const syncPanelHeight = () => {
      const panel = mobilePanelRef.current;
      if (!panel) return;
      const top = panel.getBoundingClientRect().top;
      setMobilePanelHeight(window.innerHeight - top);
    };

    syncPanelHeight();
    window.addEventListener("resize", syncPanelHeight);
    return () => window.removeEventListener("resize", syncPanelHeight);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-[9999] transition-transform duration-300 ease-out will-change-transform"
    >
      <RotatingEnrollmentBanner items={bannerItems} />

      <div
        className="relative mx-auto w-full max-w-[1920px] lg:mt-4 lg:w-[calc(100%-2rem)]"
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div
          className={`bg-neutral-lightest shadow-large lg:rounded-mea-sm lg:min-h-[4.5rem] ${
            mobileOpen ? "rounded-b-none" : "rounded-none"
          }`}
        >
          <div className="grid grid-cols-[1fr_auto] items-center px-[5vw] py-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:px-6 lg:py-0">
            <Link
              href="/"
              className="col-start-1 row-start-1 text-text lg:col-start-2 lg:flex lg:justify-center"
              aria-label="Midwest EA home"
              onClick={closeMobile}
            >
              <MidwestEALogo className="h-[2.62rem] w-[8.25rem]" />
            </Link>

            <button
              type="button"
              className="col-start-2 row-start-1 flex flex-col gap-1.5 p-2 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span
                className={`block h-0.5 w-6 bg-text transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-6 bg-text transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-6 bg-text transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>

            <nav
              className="-ml-4 col-start-1 row-start-1 hidden items-center lg:flex"
              aria-label="Main"
            >
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-6 text-base font-semibold"
                aria-expanded={openDropdown === "programs"}
                onMouseEnter={() => setOpenDropdown("programs")}
                onClick={() => setOpenDropdown(openDropdown === "programs" ? null : "programs")}
              >
                Programs
                <RxChevronDown
                  className={`size-4 transition-transform ${openDropdown === "programs" ? "rotate-180" : ""}`}
                />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-6 text-base font-semibold"
                aria-expanded={openDropdown === "courses"}
                onMouseEnter={() => setOpenDropdown("courses")}
                onClick={() => setOpenDropdown(openDropdown === "courses" ? null : "courses")}
              >
                Courses
                <RxChevronDown
                  className={`size-4 transition-transform ${openDropdown === "courses" ? "rotate-180" : ""}`}
                />
              </button>
            </nav>

            <nav
              className="-mr-4 col-start-3 row-start-1 hidden items-center justify-end lg:flex"
              aria-label="Secondary"
            >
              <Link
                href="/faq"
                className="px-4 py-6 text-base font-semibold"
                onClick={closeMobile}
              >
                FAQ
              </Link>
            </nav>
          </div>
        </div>

        {openDropdown && (
          <div className="absolute inset-x-0 top-full z-50 -mt-2 hidden lg:block">
            <div className="overflow-hidden rounded-b-mea-sm border border-neutral-lighter bg-white">
              {openDropdown === "programs" ? (
                <MegaMenuPanel
                  howItWorksHref="/how-it-works/programs"
                  columns={programLinkColumns}
                />
              ) : (
                <MegaMenuPanel
                  howItWorksHref="/how-it-works/couress"
                  columns={courseLinkColumns}
                  narrowColumns={courseLinkColumnsNarrow}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[1920px] lg:w-[calc(100%-2rem)]">
        <div
          ref={mobilePanelRef}
          aria-hidden={!mobileOpen}
          className="overflow-hidden bg-neutral-lightest transition-[max-height] duration-300 ease-out lg:hidden"
          style={{
            height: mobileOpen ? mobilePanelHeight : 0,
            maxHeight: mobileOpen ? mobilePanelHeight : 0,
          }}
        >
          <MobileMenuPanel onClose={closeMobile} />
        </div>
      </div>
    </header>
  );
}
