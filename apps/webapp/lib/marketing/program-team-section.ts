import type { PageSection } from "@/lib/marketing/site-config";
import { trainerTeamMembers } from "@/lib/marketing/trainer-team-members";

/** Shared instructors section used on all program pages (maps to Webflow section_trainers / Team 2). */
export const programTeamSection: PageSection = {
  type: "component",
  component: "Team 2",
  props: {
    tagline: "Kansas City's best instructors",
    heading: "Learn from real responders",
    description:
      "Kansas City's top EMS professionals bring real experience and field-tested insight to every course.",
    teamMembers: [...trainerTeamMembers],
    footer: {
      heading: "",
      description: "",
      button: { title: "" },
    },
  },
};
