import type { ComponentType } from "react";
import { Content7 } from "@/components/marketing/content-7";
import { Cta36 } from "@/components/marketing/cta-36";
import { Faq6 } from "@/components/marketing/faq-6";
import { FaqHero } from "@/components/marketing/faq-hero";
import { Gallery22 } from "@/components/marketing/gallery-22";
import { Header60 } from "@/components/marketing/header-60";
import { Header64 } from "@/components/marketing/header-64";
import { Header108 } from "@/components/marketing/header-108";
import { Layout1 } from "@/components/marketing/layout-1";
import { Layout54 } from "@/components/marketing/layout-54";
import { Layout137 } from "@/components/marketing/layout-137";
import { Layout228 } from "@/components/marketing/layout-228";
import { Layout349 } from "@/components/marketing/layout-349";
import { Layout423 } from "@/components/marketing/layout-423";
import { Layout493 } from "@/components/marketing/layout-493";
import { Layout520 } from "@/components/marketing/layout-520";
import { Product1 } from "@/components/marketing/product-1";
import { ProductHeader6 } from "@/components/marketing/product-header-6";
import { Stats33 } from "@/components/marketing/stats-33";
import { PoliciesList } from "@/components/marketing/policies-list";
import { ParamedicPricing } from "@/components/marketing/paramedic-pricing";
import { Team2 } from "@/components/marketing/team-2";
import { Testimonial1 } from "@/components/marketing/testimonial-1";
import { Testimonial3 } from "@/components/marketing/testimonial-3";

export type ComponentKey =
  | "Layout 520"
  | "Layout 349"
  | "Layout 54"
  | "Layout 493"
  | "FAQ 6"
  | "FaqHero"
  | "Policies List"
  | "Product Header 6"
  | "Gallery 22"
  | "Layout 423"
  | "Testimonial 1"
  | "Header 60"
  | "Product 1"
  | "Header 108"
  | "Layout 137"
  | "Layout 1"
  | "Layout 228"
  | "Stats 33"
  | "Paramedic Pricing"
  | "Team 2"
  | "Testimonial 3"
  | "CTA 36"
  | "Header 64"
  | "Content 7";

export const componentRegistry: Record<ComponentKey, ComponentType> = {
  "Layout 520": Layout520,
  "Layout 349": Layout349,
  "Layout 54": Layout54,
  "Layout 493": Layout493,
  "FAQ 6": Faq6,
  FaqHero: FaqHero,
  "Policies List": PoliciesList,
  "Product Header 6": ProductHeader6,
  "Gallery 22": Gallery22,
  "Layout 423": Layout423,
  "Testimonial 1": Testimonial1,
  "Header 60": Header60,
  "Product 1": Product1,
  "Header 108": Header108,
  "Layout 137": Layout137,
  "Layout 1": Layout1,
  "Layout 228": Layout228,
  "Stats 33": Stats33,
  "Paramedic Pricing": ParamedicPricing,
  "Team 2": Team2,
  "Testimonial 3": Testimonial3,
  "CTA 36": Cta36,
  "Header 64": Header64,
  "Content 7": Content7,
};
