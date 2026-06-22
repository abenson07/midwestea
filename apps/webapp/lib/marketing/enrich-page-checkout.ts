import type { PageConfig, PageSection } from "@/lib/marketing/site-config";
import { checkoutDetailsUrl, courseDetailUrlWithClass } from "@/lib/marketing/checkout-url";
import {
  formatClassStartDateOrdinal,
  formatPriceForProse,
  formatPriceFromCents,
  formatWholeDollarsFromCents,
  getCourseCodeFromRoute,
  replaceEmbeddedDollarAmount,
} from "@/lib/marketing/active-classes-server";
import {
  getMarketingPricingByCourseCodes,
  getMarketingPricingForRoute,
  getProgramPriceCents,
  getRegisterPriceCents,
  getTotalPriceCents,
  type MarketingPricing,
} from "@/lib/marketing/marketing-pricing";
import { homeCourseSlides } from "@/lib/marketing/home-page-data";
import { ParamedicPricingDefaults } from "@/components/marketing/paramedic-pricing";

/** Shallow-clone section props so React nodes in content are preserved. */
function cloneSectionProps(section: PageSection): PageSection {
  if (!section.props) return section;
  return { ...section, props: { ...section.props } };
}

function isEnrollmentPriceNote(note: string): boolean {
  return /^Get certified/i.test(note.trim());
}

function formatCurrencyForDisplay(cents: number | null | undefined): string {
  return formatPriceFromCents(cents);
}

function applyPricingToProps(
  props: Record<string, unknown>,
  pricing: MarketingPricing
): void {
  const priceFields = {
    price: pricing.price,
    registrationFee: pricing.registrationFee,
  };
  const registrationFee = formatPriceFromCents(getRegisterPriceCents(priceFields));
  const programPriceCents = getProgramPriceCents(priceFields);
  const programPrice = formatWholeDollarsFromCents(programPriceCents);
  const programPriceProse = formatPriceForProse(programPriceCents);
  const hasSplitPricing = getTotalPriceCents(priceFields) != null;
  const isWaitlist = pricing.mode === "waitlist";

  if (props.courseHeader && typeof props.courseHeader === "object") {
    const headerUpdate: Record<string, unknown> = {
      ...(props.courseHeader as Record<string, unknown>),
      ...(registrationFee ? { registerPrice: registrationFee } : {}),
      variant: pricing.mode,
    };
    if (isWaitlist) {
      headerUpdate.waitlistHref = pricing.actionUrl;
      headerUpdate.waitlistLabel = "Join waitlist";
    } else {
      headerUpdate.registerUrl = pricing.actionUrl;
    }
    props.courseHeader = headerUpdate;
  }

  if (isWaitlist) {
    props.waitlistHref = pricing.actionUrl;
    props.waitlistLabel = props.waitlistLabel ?? "Join waitlist";
    props.variant = "waitlist";
  } else {
    if (typeof props.registerHref === "string") {
      props.registerHref = pricing.actionUrl;
    }
    props.variant = "register";
  }

  if (registrationFee && typeof props.registerPrice === "string") {
    props.registerPrice = registrationFee;
  }

  if (registrationFee && typeof props.price === "string") {
    props.price = registrationFee;
  }

  if (hasSplitPricing && programPrice) {
    props.totalPrice = programPrice;
  } else if (programPrice && typeof props.totalPrice === "string") {
    props.totalPrice = programPrice;
  }

  if (programPriceProse && typeof props.priceNote === "string") {
    const note = props.priceNote;
    if (/\$[\d,]+/.test(note) && !isEnrollmentPriceNote(note)) {
      props.priceNote = replaceEmbeddedDollarAmount(note, programPriceProse);
    }
  }

  if (pricing.classStartDate && typeof props.classStartDate === "string") {
    props.classStartDate = formatClassStartDateOrdinal(pricing.classStartDate);
  }

  if (pricing.mode === "register" && pricing.actionUrl) {
    props.classStartHref = pricing.actionUrl;
  }
}

function applyParamedicPricingToProps(
  props: Record<string, unknown>,
  pricing: MarketingPricing
): void {
  const priceFields = {
    price: pricing.price,
    registrationFee: pricing.registrationFee,
  };
  const regCents = getRegisterPriceCents(priceFields);
  const totalCents = getProgramPriceCents(priceFields);

  const defaults = ParamedicPricingDefaults;
  const payments = [...defaults.payments];
  if (regCents != null) {
    const regFormatted = formatPriceForProse(regCents);
    payments[0] = {
      ...payments[0],
      amount: `$${regFormatted} registration fee`,
    };
  }

  const included = { ...defaults.included };
  if (totalCents != null) {
    const totalFormatted = (totalCents / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    included.footerAmount = `$${totalFormatted}`;
  }

  props.heading = defaults.heading;
  props.intro = defaults.intro;
  props.payments = payments;
  props.included = { ...included, items: defaults.included.items };
  props.excluded = defaults.excluded;
}

async function enrichCourseGallerySections(
  sections: PageSection[]
): Promise<PageSection[]> {
  const enriched = sections.map(cloneSectionProps);

  const codesNeeded = new Set<string>();
  for (const section of enriched) {
    if (section.type !== "component" || section.component !== "Product 1") continue;
    const products = section.props?.products;
    if (!Array.isArray(products)) continue;
    for (const product of products) {
      if (!product?.url) continue;
      const code = getCourseCodeFromRoute(String(product.url));
      if (code) codesNeeded.add(code);
    }
  }

  const pricingByCode = await getMarketingPricingByCourseCodes([...codesNeeded]);

  for (const section of enriched) {
    if (section.type !== "component" || section.component !== "Product 1") continue;
    const products = section.props?.products;
    if (!Array.isArray(products) || !section.props) continue;

    section.props = {
      ...section.props,
      products: products.map((product) => {
        if (!product || typeof product !== "object" || !product.url) return product;
        const route = String(product.url);
        const courseCode = getCourseCodeFromRoute(route);
        if (!courseCode) return product;

        const pricing = pricingByCode.get(courseCode.toUpperCase());
        if (!pricing) return product;

        const displayPrice = formatCurrencyForDisplay(
          getRegisterPriceCents({
            price: pricing.price,
            registrationFee: pricing.registrationFee,
          })
        );

        const url =
          pricing.mode === "register" && pricing.classId
            ? courseDetailUrlWithClass(route, pricing.classId, pricing.courseCode)
            : route.split("?")[0];

        return {
          ...product,
          ...(displayPrice ? { price: `$${displayPrice}` } : {}),
          url,
        };
      }),
    };
  }

  return enriched;
}

async function enrichProgramGallerySections(
  sections: PageSection[]
): Promise<PageSection[]> {
  const enriched = sections.map(cloneSectionProps);

  const codesNeeded = new Set<string>();
  for (const section of enriched) {
    if (section.type !== "custom" || section.label !== "ProgramsScroller") continue;
    const programs = section.props?.programs;
    if (!Array.isArray(programs)) continue;
    for (const program of programs) {
      if (!program?.href) continue;
      const code = getCourseCodeFromRoute(String(program.href));
      if (code) codesNeeded.add(code);
    }
  }

  const pricingByCode = await getMarketingPricingByCourseCodes([...codesNeeded]);

  for (const section of enriched) {
    if (section.type !== "custom" || section.label !== "ProgramsScroller") continue;
    const programs = section.props?.programs;
    if (!Array.isArray(programs) || !section.props) continue;

    section.props = {
      ...section.props,
      programs: programs.map((program) => {
        if (!program || typeof program !== "object" || !program.href) return program;
        const route = String(program.href);
        const courseCode = getCourseCodeFromRoute(route);
        if (!courseCode) return program;

        const pricing = pricingByCode.get(courseCode.toUpperCase());
        if (!pricing) return program;

        const programPriceProse = formatPriceForProse(
          getProgramPriceCents({
            price: pricing.price,
            registrationFee: pricing.registrationFee,
          })
        );
        let priceNote = program.priceNote;
        if (
          programPriceProse &&
          typeof priceNote === "string" &&
          /\$[\d,]+/.test(priceNote)
        ) {
          priceNote = replaceEmbeddedDollarAmount(priceNote, programPriceProse);
        }

        const href =
          pricing.mode === "register" && pricing.classId
            ? courseDetailUrlWithClass(route, pricing.classId, pricing.courseCode)
            : route.split("?")[0];

        return {
          ...program,
          ...(priceNote ? { priceNote } : {}),
          href,
        };
      }),
    };
  }

  return enriched;
}

async function enrichHomeCourseSlidesSections(
  sections: PageSection[]
): Promise<PageSection[]> {
  const codesNeeded = homeCourseSlides
    .map((slide) => getCourseCodeFromRoute(slide.href))
    .filter((code): code is string => Boolean(code));

  const pricingByCode = await getMarketingPricingByCourseCodes(codesNeeded);

  const courses = homeCourseSlides.map((slide) => {
    const courseCode = getCourseCodeFromRoute(slide.href);
    if (!courseCode) return slide;

    const pricing = pricingByCode.get(courseCode.toUpperCase());
    if (!pricing) return slide;

    const displayPrice = formatCurrencyForDisplay(
      getRegisterPriceCents({
        price: pricing.price,
        registrationFee: pricing.registrationFee,
      })
    );

    const href =
      pricing.mode === "register" && pricing.classId
        ? courseDetailUrlWithClass(slide.href, pricing.classId, pricing.courseCode)
        : slide.href.split("?")[0];

    return {
      ...slide,
      ...(displayPrice ? { price: `$${displayPrice}` } : {}),
      href,
    };
  });

  return sections.map((section) => {
    if (section.type !== "custom" || section.label !== "CoursesHome") {
      return section;
    }
    return {
      ...section,
      props: {
        ...(section.props ?? {}),
        courses,
      },
    };
  });
}

function enrichSectionsWithPricing(
  sections: PageSection[],
  pricing: MarketingPricing
): PageSection[] {
  return sections.map((section) => {
    const cloned = cloneSectionProps(section);
    if (cloned.props) {
      applyPricingToProps(cloned.props, pricing);
      if (
        cloned.type === "component" &&
        cloned.component === "Paramedic Pricing"
      ) {
        applyParamedicPricingToProps(cloned.props, pricing);
      }
    }
    return cloned;
  });
}

export async function enrichPageWithCheckoutUrls(page: PageConfig): Promise<PageConfig> {
  if (page.route === "/") {
    return {
      ...page,
      sections: await enrichHomeCourseSlidesSections(page.sections),
    };
  }

  if (page.route === "/courses") {
    return {
      ...page,
      sections: await enrichCourseGallerySections(page.sections),
    };
  }

  if (page.route === "/programs") {
    return {
      ...page,
      sections: await enrichProgramGallerySections(page.sections),
    };
  }

  const pricing = await getMarketingPricingForRoute(page.route);
  if (!pricing) {
    return page;
  }

  return {
    ...page,
    sections: enrichSectionsWithPricing(page.sections, pricing),
  };
}
