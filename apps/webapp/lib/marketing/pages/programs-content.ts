import type { PageSection } from "@/lib/marketing/site-config";
import { programGalleryPanels } from "@/lib/marketing/programs-gallery-data";

export const programsSections: PageSection[] = [
  { type: "custom", label: "ProgramGalleryHero" },
  {
    type: "custom",
    label: "ProgramsScroller",
    props: { programs: programGalleryPanels },
  },
];
