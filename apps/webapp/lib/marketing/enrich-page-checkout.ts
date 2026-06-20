import type { PageConfig, PageSection } from "@/lib/marketing/site-config";
import type { ActiveClass } from "@/lib/marketing/active-classes-server";
import { checkoutDetailsUrl, courseDetailUrlWithClass } from "@/lib/marketing/checkout-url";
import {
  formatActiveClassDisplayPrice,
  formatPriceForProse,
  formatPriceFromCents,
  formatWholeDollarsFromCents,
  getActiveClassesForCourseCode,
  getActiveClassProgramPriceCents,
  getActiveClassRegisterPriceCents,
  getActiveClassTotalPriceCents,
  getCourseCodeFromRoute,
  getPrimaryActiveClassForRoute,
  replaceEmbeddedDollarAmount,
} from "@/lib/marketing/active-classes-server";

/** Shallow-clone section props so React nodes in content are preserved. */
function cloneSectionProps(section: PageSection): PageSection {
  if (!section.props) return section;
  return { ...section, props: { ...section.props } };
}

function isEnrollmentPriceNote(note: string): boolean {
  return /^Get certified/i.test(note.trim());
}

function applyActiveClassPricingToProps(
  props: Record<string, unknown>,
  activeClass: ActiveClass,
  registerUrl: string
): void {
  const registrationFee = formatPriceFromCents(
    getActiveClassRegisterPriceCents(activeClass)
  );
  const programPriceCents = getActiveClassProgramPriceCents(activeClass);
  const programPrice = formatWholeDollarsFromCents(programPriceCents);
  const programPriceProse = formatPriceForProse(programPriceCents);
  const hasSplitPricing = getActiveClassTotalPriceCents(activeClass) != null;

  if (props.courseHeader && typeof props.courseHeader === "object") {
    props.courseHeader = {
      ...(props.courseHeader as Record<string, unknown>),
      registerUrl,
      ...(registrationFee ? { registerPrice: registrationFee } : {}),
    };
  }

  if (typeof props.registerHref === "string") {
    props.registerHref = registerUrl;
  }

  if (registrationFee && typeof props.registerPrice === "string") {
    props.registerPrice = registrationFee;
  }

  // Enrollment bar deposit line uses registration_fee.
  if (registrationFee && typeof props.price === "string") {
    props.price = registrationFee;
  }

  // Enrollment bar bold total uses full program price when split pricing exists.
  if (hasSplitPricing && programPrice) {
    props.totalPrice = programPrice;
  } else if (programPrice && typeof props.totalPrice === "string") {
    props.totalPrice = programPrice;
  }

  // Hero / gallery prose (e.g. "all for $2,150") uses full program price.
  if (programPriceProse && typeof props.priceNote === "string") {
    const note = props.priceNote;
    if (/\$[\d,]+/.test(note) && !isEnrollmentPriceNote(note)) {
      props.priceNote = replaceEmbeddedDollarAmount(note, programPriceProse);
    }
  }
}

async function fetchActiveClassesByCodes(codes: string[]) {
  const courseCodes = new Map<
    string,
    Awaited<ReturnType<typeof getActiveClassesForCourseCode>>
  >();
  await Promise.all(
    codes.map(async (code) => {
      courseCodes.set(code, await getActiveClassesForCourseCode(code));
    })
  );
  return courseCodes;
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

  const courseCodes = await fetchActiveClassesByCodes([...codesNeeded]);

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

        const activeClass = courseCodes.get(courseCode)?.[0];
        if (!activeClass) return product;

        const displayPrice = formatActiveClassDisplayPrice(activeClass);
        return {
          ...product,
          ...(displayPrice ? { price: `$${displayPrice}` } : {}),
          url: courseDetailUrlWithClass(
            route,
            activeClass.classId,
            activeClass.courseCode
          ),
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

  const courseCodes = await fetchActiveClassesByCodes([...codesNeeded]);

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

        const activeClass = courseCodes.get(courseCode)?.[0];
        if (!activeClass) return program;

        const programPriceProse = formatPriceForProse(
          getActiveClassProgramPriceCents(activeClass)
        );
        let priceNote = program.priceNote;
        if (
          programPriceProse &&
          typeof priceNote === "string" &&
          /\$[\d,]+/.test(priceNote)
        ) {
          priceNote = replaceEmbeddedDollarAmount(priceNote, programPriceProse);
        }

        return {
          ...program,
          ...(priceNote ? { priceNote } : {}),
          href: courseDetailUrlWithClass(
            route,
            activeClass.classId,
            activeClass.courseCode
          ),
        };
      }),
    };
  }

  return enriched;
}

export async function enrichPageWithCheckoutUrls(page: PageConfig): Promise<PageConfig> {
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

  const activeClass = await getPrimaryActiveClassForRoute(page.route);
  if (!activeClass) {
    return page;
  }

  const registerUrl = checkoutDetailsUrl(activeClass.classId, activeClass.courseCode);

  const sections = page.sections.map((section) => {
    const cloned = cloneSectionProps(section);
    if (cloned.props) {
      applyActiveClassPricingToProps(cloned.props, activeClass, registerUrl);
    }
    return cloned;
  });

  return { ...page, sections };
}
