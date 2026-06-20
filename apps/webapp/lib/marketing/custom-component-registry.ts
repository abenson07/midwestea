import type { ComponentType } from "react";
import { CoursesHome } from "@/components/marketing/courses-home";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomePrograms } from "@/components/marketing/home-programs";
import { HomeTestimonial } from "@/components/marketing/home-testimonial";
import { ProgramGalleryHero } from "@/components/marketing/program-gallery-hero";
import { ProgramsScroller } from "@/components/marketing/programs-scroller";
import { Trainers } from "@/components/marketing/trainers";
import { WaysToLearn } from "@/components/marketing/ways-to-learn";

export type CustomComponentKey =
  | "HomeHero"
  | "HomePrograms"
  | "WaysToLearn"
  | "HomeTestimonial"
  | "Trainers"
  | "CoursesHome"
  | "ProgramGalleryHero"
  | "ProgramsScroller";

export const customComponentRegistry: Record<
  CustomComponentKey,
  ComponentType<Record<string, unknown>>
> = {
  HomeHero,
  HomePrograms,
  WaysToLearn,
  HomeTestimonial,
  Trainers,
  CoursesHome,
  ProgramGalleryHero,
  ProgramsScroller,
};

export function isCustomComponentKey(label: string): label is CustomComponentKey {
  return label in customComponentRegistry;
}
