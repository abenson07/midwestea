import type { ComponentType } from "react";
import { Content7 } from "@/components/content-7";
import { Cta36 } from "@/components/cta-36";
import { Faq6 } from "@/components/faq-6";
import { FaqHero } from "@/components/faq-hero";
import { Gallery22 } from "@/components/gallery-22";
import { Header60 } from "@/components/header-60";
import { Header64 } from "@/components/header-64";
import { Header108 } from "@/components/header-108";
import { Layout1 } from "@/components/layout-1";
import { Layout54 } from "@/components/layout-54";
import { Layout137 } from "@/components/layout-137";
import { Layout228 } from "@/components/layout-228";
import { Layout349 } from "@/components/layout-349";
import { Layout423 } from "@/components/layout-423";
import { Layout493 } from "@/components/layout-493";
import { Layout520 } from "@/components/layout-520";
import { Product1 } from "@/components/product-1";
import { ProductHeader6 } from "@/components/product-header-6";
import { Stats33 } from "@/components/stats-33";
import { PoliciesList } from "@/components/policies-list";
import { ParamedicPricing } from "@/components/paramedic-pricing";
import { Team2 } from "@/components/team-2";
import { Testimonial1 } from "@/components/testimonial-1";
import { Testimonial3 } from "@/components/testimonial-3";

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
