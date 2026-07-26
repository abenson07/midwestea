import type { Header82Props } from "./components/header-82";
import type { Layout1Props } from "./components/layout-1";
import type { Layout141Props } from "./components/layout-141";
import type { Layout241Props } from "./components/layout-241";
import type { Content12Props } from "./components/content-12";
import type { Testimonial19Props } from "./components/testimonial-19";
import type { Cta25Props } from "./components/cta-25";
import type { Header108Props } from "./components/header-108";
import type { Faq6Props } from "@/components/marketing/faq-6";

export type StationChiefContent = {
  header82: Header82Props;
  layout1A: Layout1Props;
  layout1B: Layout1Props;
  layout1C: Layout1Props;
  layout141: Layout141Props;
  layout241: Layout241Props;
  content12: Omit<Content12Props, "children"> & { body: string };
  testimonial19: Testimonial19Props;
  cta25: Cta25Props;
  faqBanner: Faq6Props;
  header108: Header108Props;
};

export const stationChiefContent: StationChiefContent = {
  header82: {
    heading: "Give your crew a clear path to paramedic certification.",
    description:
      "Midwest EMS Academy partners with fire and EMS departments to move firefighters and EMTs up to paramedic, without disrupting shift schedules.",
    buttons: [{ title: "See program options for your department" }],
    video: "https://www.youtube.com/embed/8DKLYsikxTs?si=Ch9W0KrDWWUiCMMW",
    image: {
      src: "/images/placeholder.svg",
      alt: "Station crew training together",
    },
  },
  layout1A: {
    tagline: "Built for shift work",
    heading: "Training that works around 24/48 schedules",
    description:
      "Cohorts are scheduled around common fire/EMS shift rotations, so your crew doesn't have to choose between work and certification.",
    buttons: [{ title: "See the schedule", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Firefighter reviewing a class schedule" },
  },
  layout1B: {
    tagline: "Accreditation",
    heading: "CAAHEP-accredited paramedic training",
    description:
      "Your department can be confident every graduate meets the same accreditation standard, department-wide.",
    buttons: [{ title: "See accreditation details", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Paramedic certification ceremony" },
  },
  layout1C: {
    tagline: "Career ladder",
    heading: "A clear step up from EMT to paramedic",
    description:
      "Give firefighters and EMTs on your roster a defined path to advance, without leaving your department to do it.",
    buttons: [{ title: "See career paths", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Paramedic on duty" },
  },
  layout141: {
    tagline: "Department partnerships",
    heading: "Group enrollment and tuition assistance",
    description:
      "We work directly with training officers to coordinate group enrollment and tuition assistance conversations for your department.",
    buttons: [{ title: "Talk to admissions about your department", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Training officer meeting with academy staff" },
  },
  layout241: {
    tagline: "The result",
    heading: "What departments get",
    description:
      "A dependable pipeline of certified paramedics, trained to one consistent standard.",
    sections: [
      {
        icon: { src: "/images/placeholder.svg", alt: "Accredited icon" },
        heading: "Accredited",
        description: "CAAHEP-accredited paramedic certification for every graduate.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Flexible icon" },
        heading: "Flexible",
        description: "Cohorts scheduled around shift rotations, not the other way around.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Supported icon" },
        heading: "Supported",
        description: "A dedicated admissions contact for department-wide enrollment.",
      },
    ],
    buttons: [{ title: "Start a conversation" }],
  },
  content12: {
    body: "We work directly with training officers and station chiefs to schedule cohorts, coordinate tuition assistance conversations, and track certification progress for the whole crew — not just one recruit at a time.",
    metatags: [
      { title: "Department Partnerships", description: "Group enrollment support" },
      { title: "Tuition Assistance", description: "Guidance for department funding conversations" },
    ],
  },
  testimonial19: {
    heading: "Hear from a training officer",
    description: "Real feedback from a department that partnered with the academy.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "We needed a program that respected our crew's 24/48 schedule and still met accreditation standards. Midwest EMS Academy delivered both.",
        avatar: { src: "/images/placeholder.svg", alt: "Training officer" },
        name: "Station Training Officer",
        position: "Training Officer",
        companyName: "Regional Fire & EMS Department",
      },
    ],
  },
  cta25: {
    heading: "Ready to build your department's paramedic pipeline?",
    description: "Talk to admissions about group enrollment for your crew.",
    buttons: [{ title: "Talk to admissions" }],
  },
  faqBanner: {
    heading: "Questions from station chiefs and training officers",
    description: "What department leads ask most before enrolling their crew.",
    questions: [
      {
        title: "Can training schedules work around 24/48 shift rotations?",
        answer:
          "Yes — cohorts are scheduled specifically around common fire/EMS shift patterns.",
      },
      {
        title: "Is tuition assistance available for department-sponsored students?",
        answer:
          "An admissions advisor can walk your department through tuition assistance and funding options.",
      },
      {
        title: "Is the paramedic program accredited?",
        answer: "Yes — the paramedic program is CAAHEP-accredited.",
      },
      {
        title: "How long does paramedic certification take?",
        answer:
          "Most students complete certification in under a year, depending on prior EMT experience.",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "Ready to build your department's paramedic pipeline?",
    description:
      "Give your crew a clear, accredited path to paramedic certification.",
    buttons: [{ title: "Talk to admissions" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Paramedic students training" },
      { src: "/images/placeholder.svg", alt: "Paramedic on an emergency call" },
      { src: "/images/placeholder.svg", alt: "Paramedic academy graduation" },
    ],
  },
};
