import type { Redirect } from "next/dist/lib/load-custom-routes";

/** Improved destinations for legacy paths that previously pointed at the homepage. */
export const WEBFLOW_HOMEPAGE_IMPROVEMENTS: Record<string, string> = {
  "/about-us": "/about?utm_source=old_site",
  "/how-it-works": "/how-it-works/programs?utm_source=old_site",
  "/gallery": "/courses?utm_source=old_site",
};

type CartRedirectEntry = {
  cartId: string;
  destination: string;
  sources: string[];
  utm?: string;
};

function buildCartRedirects(entries: CartRedirectEntry[]): Redirect[] {
  return entries.flatMap(({ sources, cartId, destination, utm = "old_site" }) =>
    sources.map((source) => ({
      source,
      has: [{ type: "query" as const, key: "add-to-cart", value: cartId }],
      destination: `${destination}?utm_source=${utm}`,
      permanent: true,
    })),
  );
}

const cartRedirectEntries: CartRedirectEntry[] = [
  {
    cartId: "7581",
    destination: "/basic-life-support",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7619",
    destination: "/advanced-cardiovascular-life-support",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7622",
    destination: "/pediatric-advanced-life-support",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7623",
    destination: "/cpr-first-aid",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7624",
    destination: "/pediatric-first-aid-cpr-aed",
    sources: ["/courses-2", "/shop/page/2"],
  },
  {
    cartId: "7625",
    destination: "/child-and-babysitting-safety",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7630",
    destination: "/use-and-administration-of-epinephrine-auto-injectors",
    sources: ["/courses-2", "/shop/page/2"],
  },
  {
    cartId: "7632",
    destination: "/bloodborne-pathogens",
    sources: ["/courses-2", "/shop"],
  },
  {
    cartId: "7634",
    destination: "/emergency-use-of-medical-oxygen",
    sources: ["/courses-2", "/", "/shop"],
  },
  {
    cartId: "8154",
    destination: "/active-shooter-training",
    sources: ["/", "/courses-2", "/shop"],
  },
  {
    cartId: "8320",
    destination: "/emergency-medical-responder",
    sources: ["/shop", "/programs"],
  },
  {
    cartId: "8381",
    destination: "/cpr-first-aid",
    sources: ["/courses-2", "/", "/shop/page/2"],
  },
  {
    cartId: "8448",
    destination: "/pediatric-first-aid-cpr-aed",
    sources: ["/", "/courses-2", "/shop"],
  },
  {
    cartId: "12976",
    destination: "/community-paramedic",
    sources: ["/", "/programs", "/shop"],
  },
  {
    cartId: "13000",
    destination: "/advanced-tactical-casualty-care",
    sources: ["/", "/programs", "/shop"],
  },
  {
    cartId: "13009",
    destination: "/critical-care-transport",
    sources: ["/", "/programs", "/shop"],
  },
];

export const webflowCartRedirects = buildCartRedirects(cartRedirectEntries);

export const webflowPathRedirects: Redirect[] = [
  { source: "/product/advanced-cardiovascular-life-support", destination: "/advanced-cardiovascular-life-support?utm_source=old_site", permanent: true },
  { source: "/product/bloodborne-pathogens", destination: "/bloodborne-pathogens?utm_source=old_site", permanent: true },
  { source: "/courses-2", destination: "/courses?utm_source=old_site", permanent: true },
  { source: "/how-it-works", destination: WEBFLOW_HOMEPAGE_IMPROVEMENTS["/how-it-works"], permanent: true },
  { source: "/product/active-shooter-training-empower-your-team", destination: "/active-shooter-training?utm_source=old_site", permanent: true },
  { source: "/my-account/lost-password", destination: "/?utm_source=old_site", permanent: true },
  { source: "/gallery", destination: WEBFLOW_HOMEPAGE_IMPROVEMENTS["/gallery"], permanent: true },
  { source: "/product/advanced-tactical-casualty-care", destination: "/advanced-tactical-casualty-care?utm_source=old_site", permanent: true },
  { source: "/product/child-and-babysitting-safety", destination: "/child-and-babysitting-safety?utm_source=old_site", permanent: true },
  { source: "/my-account", destination: "/?utm_source=old_site", permanent: true },
  { source: "/about-us", destination: WEBFLOW_HOMEPAGE_IMPROVEMENTS["/about-us"], permanent: true },
  { source: "/contact-us", destination: "/contact?utm_source=old_site", permanent: true },
  { source: "/product/basic-life-support", destination: "/basic-life-support?utm_source=old_site", permanent: true },
  { source: "/faqs", destination: "/faq?utm_source=old_site", permanent: true },
  { source: "/cart", destination: "/courses?utm_source=old_site", permanent: true },
  {
    source: "/product/emt-basic-online-continuing-education-refresher-courses",
    destination: "/courses?utm_source=refesher_courses",
    permanent: true,
  },
  { source: "/product/critical-care-paramedic", destination: "/critical-care-transport?utm_source=old_site", permanent: true },
  { source: "/product/emergency-medical-technitian", destination: "/emergency-medical-technician?utm_source=old_site", permanent: true },
  { source: "/critical-care-paramedic", destination: "/critical-care-transport", permanent: true },
  { source: "/product/emergency-medical-responder", destination: "/emergency-medical-responder?utm_source=old_site", permanent: true },
  { source: "/product/community-paramedic", destination: "/community-paramedic?utm_source=old_site", permanent: true },
  { source: "/request-information-emt", destination: "/emergency-medical-technician?utm_source=old_site", permanent: true },
  { source: "/shop", destination: "/courses?utm_source=old_site", permanent: true },
  { source: "/product/paramedic", destination: "/paramedic?utm_source=old_site", permanent: true },
  {
    source: "/product/use-and-administration-of-epinephrine-auto-injectors",
    destination: "/use-and-administration-of-epinephrine-auto-injectors?utm_source=old_site",
    permanent: true,
  },
  { source: "/product/cpr-first-aid", destination: "/cpr-first-aid?utm_source=old_site", permanent: true },
  { source: "/product/rcp-primeros-auxilios", destination: "/?utm_source=old_site", permanent: true },
  { source: "/shop/page/:page", destination: "/courses?utm_source=old_site", permanent: true },
  { source: "/product/pediatric-advanced-life-support-pals", destination: "/pediatric-advanced-life-support?utm_source=old_site", permanent: true },
  { source: "/product/primeros-auxilios-pediatricos-rcp-dea", destination: "/?utm_source=old_site", permanent: true },
  { source: "/product/pediatric-first-aid-cpr-aed", destination: "/pediatric-first-aid-cpr-aed?utm_source=old_site", permanent: true },
  { source: "/product/emergency-use-of-medical-oxygen", destination: "/emergency-use-of-medical-oxygen?utm_source=old_site", permanent: true },
  { source: "/how-it-works/courses-how-it-works", destination: "/how-it-works/couress", permanent: true },
  { source: "/how-it-works/programs-how-it-works", destination: "/how-it-works/programs", permanent: true },
];
