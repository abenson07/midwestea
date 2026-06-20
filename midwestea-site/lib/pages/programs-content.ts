import type { PageSection } from "@/lib/site-config";
import { programGalleryPanels } from "@/lib/programs-gallery-data";

export const programsSections: PageSection[] = [
  { type: "custom", label: "ProgramGalleryHero" },
  {
    type: "custom",
    label: "ProgramsScroller",
    props: { programs: programGalleryPanels },
  },
];
