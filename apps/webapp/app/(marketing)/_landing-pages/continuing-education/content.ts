import type { Header137Props } from "./components/header-137";
import type { Layout1Props } from "./components/layout-1";
import type { Layout48Props } from "./components/layout-48";
import type { Content2Props } from "./components/content-2";
import type { Testimonial19Props } from "./components/testimonial-19";
import type { Cta25Props } from "./components/cta-25";
import type { Header108Props } from "./components/header-108";
import type { Faq6Props } from "@/components/marketing/faq-6";

export type ContinuingEducationContent = {
  header137: Header137Props;
  layout1A: Layout1Props;
  layout48: Layout48Props;
  layout1B: Layout1Props;
  layout1C: Layout1Props;
  layout1D: Layout1Props;
  content2: Omit<Content2Props, "children"> & { body: string };
  testimonial19: Testimonial19Props;
  cta25: Cta25Props;
  faqBanner: Faq6Props;
  header108: Header108Props;
};

export const continuingEducationContent: ContinuingEducationContent = {
  header137: {
    heading: "Keep your certification current — and your career moving.",
    description:
      "Midwest EMS Academy's continuing education courses help working EMTs and paramedics track CE credits and add new certifications.",
    buttons: [{ title: "Browse continuing education courses" }],
    firstImage: { src: "/images/placeholder.svg", alt: "Paramedic completing a CE course" },
    secondImage: { src: "/images/placeholder.svg", alt: "EMT reviewing recertification requirements" },
  },
  layout1A: {
    tagline: "CE tracking",
    heading: "Never miss a recertification deadline",
    description:
      "Track your CE credit progress in one place and get reminders before your certification lapses.",
    buttons: [{ title: "See CE tracking", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "CE credit tracking dashboard" },
  },
  layout48: {
    heading: "Course formats built around your work schedule",
    description: "Choose the format that fits how you already work.",
    subHeadings: [
      { title: "Online", description: "Self-paced CE modules you can complete on your own schedule." },
      { title: "Hybrid", description: "Online coursework paired with in-person skills sessions." },
      { title: "In-person", description: "Full in-person CE sessions at our training facility." },
    ],
  },
  layout1B: {
    tagline: "Add-on certifications",
    heading: "Expand your scope with ACLS and PALS",
    description:
      "Add advanced certifications like ACLS and PALS to your credentials without starting a new program.",
    buttons: [{ title: "See certification add-ons", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Paramedic completing ACLS training" },
  },
  layout1C: {
    tagline: "Career growth",
    heading: "Community Paramedic and advanced tracks",
    description:
      "Working paramedics can add Community Paramedic and other advanced certifications through CE coursework.",
    buttons: [{ title: "See advanced tracks", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Community paramedic on a home visit" },
  },
  layout1D: {
    tagline: "State compliance",
    heading: "CE credits that meet state requirements",
    description:
      "Every CE course is built to satisfy state recertification requirements for EMTs and paramedics.",
    buttons: [{ title: "Check state requirements", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "State certification requirements checklist" },
  },
  content2: {
    heading: "Stay ahead of your recertification deadline",
    body: "Recertification deadlines sneak up fast when you're working full-time. Our CE advisors help working EMTs and paramedics map out exactly which courses they need and when, so nothing lapses.",
    image: { src: "/images/placeholder.svg", alt: "Paramedic reviewing CE course options" },
  },
  testimonial19: {
    heading: "Hear from a working paramedic",
    description: "Real feedback from a graduate who recertified through the academy.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "I was cutting it close on my recertification deadline. The online CE modules let me finish on my own time between shifts, and I added ACLS at the same time.",
        avatar: { src: "/images/placeholder.svg", alt: "Working paramedic" },
        name: "Working Paramedic",
        position: "Paramedic",
        companyName: "Midwest EMS Academy CE Graduate",
      },
    ],
  },
  cta25: {
    heading: "Ready to stay certified?",
    description: "Check the CE course calendar or talk to an advisor about your recertification timeline.",
    buttons: [{ title: "View CE course calendar" }],
  },
  faqBanner: {
    heading: "Questions about continuing education",
    description: "What working EMTs and paramedics ask most about recertification.",
    questions: [
      {
        title: "How many CE credits do I need to recertify?",
        answer:
          "CE credit requirements vary by state and certification level — an advisor can confirm exactly what you need.",
      },
      {
        title: "Can I complete CE courses online?",
        answer: "Yes — online, hybrid, and in-person formats are all available.",
      },
      {
        title: "What does continuing education cost?",
        answer: "Cost varies by course and format — an advisor can walk you through pricing.",
      },
      {
        title: "Can I add certifications like ACLS or PALS through CE?",
        answer: "Yes — add-on certifications like ACLS and PALS are available through CE coursework.",
      },
    ],
    button: { title: "Talk to a CE advisor" },
  },
  header108: {
    title: "Stay certified. Stay ready.",
    description: "Keep your CE credits current and expand your certifications with Midwest EMS Academy.",
    buttons: [{ title: "Browse CE courses" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Paramedic completing continuing education" },
      { src: "/images/placeholder.svg", alt: "EMT recertification ceremony" },
      { src: "/images/placeholder.svg", alt: "Advanced certification training" },
    ],
  },
};
