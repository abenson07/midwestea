import type { ComponentType } from "react";
import { CoursesHome } from "@/components/courses-home";
import { HomeHero } from "@/components/home-hero";
import { HomePrograms } from "@/components/home-programs";
import { HomeTestimonial } from "@/components/home-testimonial";
import { ProgramGalleryHero } from "@/components/program-gallery-hero";
import { ProgramsScroller } from "@/components/programs-scroller";
import { Trainers } from "@/components/trainers";
import { WaysToLearn } from "@/components/ways-to-learn";

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
