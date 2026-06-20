import type { PageConfig, PageSection } from "@/lib/marketing/site-config";
import { checkoutDetailsUrl } from "@/lib/marketing/checkout-url";
import {
  formatPriceFromCents,
  getActiveClassesForCourseCode,
  getCourseCodeFromRoute,
  getPrimaryActiveClassForRoute,
} from "@/lib/marketing/active-classes-server";

/** Shallow-clone section props so React nodes in content are preserved. */
function cloneSectionProps(section: PageSection): PageSection {
  if (!section.props) return section;
  return { ...section, props: { ...section.props } };
}

function applyCheckoutToProps(
  props: Record<string, unknown>,
  registerUrl: string,
  price?: string
): void {
  if (props.courseHeader && typeof props.courseHeader === "object") {
    props.courseHeader = {
      ...(props.courseHeader as Record<string, unknown>),
      registerUrl,
      ...(price ? { registerPrice: price } : {}),
    };
  }
  if (typeof props.registerHref === "string") {
    props.registerHref = registerUrl;
  }
  if (price && typeof props.registerPrice === "string") {
    props.registerPrice = price.replace(/^\$/, "");
  }
  if (price && typeof props.price === "string") {
    props.price = price.replace(/^\$/, "");
  }
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

  const courseCodes = new Map<string, Awaited<ReturnType<typeof getActiveClassesForCourseCode>>>();
  await Promise.all(
    [...codesNeeded].map(async (code) => {
      courseCodes.set(code, await getActiveClassesForCourseCode(code));
    })
  );

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

        const price = formatPriceFromCents(activeClass.price);
        const baseUrl = route.split("?")[0];
        return {
          ...product,
          ...(price ? { price: `$${price}` } : {}),
          url: `${baseUrl}?classID=${encodeURIComponent(activeClass.classId)}`,
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

  const activeClass = await getPrimaryActiveClassForRoute(page.route);
  if (!activeClass) {
    return page;
  }

  const registerUrl = checkoutDetailsUrl(activeClass.classId, activeClass.courseCode);
  const price = formatPriceFromCents(activeClass.price);

  const sections = page.sections.map((section) => {
    const cloned = cloneSectionProps(section);
    if (cloned.props) {
      applyCheckoutToProps(cloned.props, registerUrl, price || undefined);
    }
    return cloned;
  });

  return { ...page, sections };
}
