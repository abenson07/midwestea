import type { Header137Props } from "./components/header-137";
import type { Layout1Props } from "./components/layout-1";
import type { Comparison6Props } from "./components/comparison-6";
import type { Layout241Props } from "./components/layout-241";
import type { Content2Props } from "./components/content-2";
import type { Testimonial19Props } from "./components/testimonial-19";
import type { Header108Props } from "./components/header-108";
import type { Faq6Props } from "@/components/marketing/faq-6";

export type StudentSuccessStoryContent = {
  header137: Header137Props;
  layout1A: Layout1Props;
  comparison6: Comparison6Props;
  layout1B: Layout1Props;
  layout1C: Layout1Props;
  layout241: Layout241Props;
  content2: Omit<Content2Props, "children"> & { body: string };
  testimonial19: Testimonial19Props;
  faqBanner: Faq6Props;
  header108: Header108Props;
};

export const gregStoryContent: StudentSuccessStoryContent = {
  header137: {
    heading: "Greg went from warehouse shifts to the back of an ambulance in under a year.",
    description:
      "See how Midwest EMS Academy's paramedic program helped Greg change careers without putting his life on hold.",
    buttons: [{ title: "Read Greg's story" }],
    firstImage: { src: "/images/placeholder.svg", alt: "Greg in EMS uniform" },
    secondImage: { src: "/images/placeholder.svg", alt: "Greg on shift with his crew" },
  },
  layout1A: {
    tagline: "Before EMS",
    heading: "A warehouse job with no clear path up",
    description:
      "Greg spent six years working overnight shifts in a distribution warehouse, with no real path toward a career he cared about.",
    buttons: [{ title: "See the paramedic program", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Warehouse shift work" },
  },
  comparison6: {
    tagline: "Before and after",
    heading: "What changed for Greg",
    description: "Two years apart, same person, a completely different career.",
    pricingPlans: [
      {
        planName: "Before",
        monthlyPrice: "Warehouse",
        description: "Overnight shifts, no certification, no clear advancement path.",
        button: { title: "Not for me", variant: "secondary" },
      },
      {
        planName: "After",
        monthlyPrice: "Paramedic",
        description: "Certified paramedic, full-time EMS career, hands-on daily work.",
        button: { title: "Start my story" },
      },
    ],
    featureCategories: [
      {
        title: "What Greg gained",
        features: [
          { text: "State paramedic certification", items: ["", "Yes"] },
          { text: "Predictable path to full-time work", items: ["", "Yes"] },
          { text: "Hands-on emergency medicine experience", items: ["", "Yes"] },
        ],
      },
    ],
    buttons: [{ title: "Read Greg's full story" }],
  },
  layout1B: {
    tagline: "Enrolling",
    heading: "Why Greg chose Midwest EMS Academy",
    description:
      "Greg needed a program that worked around his overnight warehouse schedule while he transitioned careers.",
    buttons: [{ title: "See program schedule", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Greg reviewing his class schedule" },
  },
  layout1C: {
    tagline: "Training",
    heading: "Hands-on training from day one",
    description:
      "Greg trained on real equipment with working paramedics as instructors, not just lecture halls.",
    buttons: [{ title: "See the paramedic curriculum", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Greg in hands-on paramedic training" },
  },
  layout241: {
    tagline: "The outcome",
    heading: "Where Greg is today",
    description: "Twelve months after enrolling, Greg was a certified, working paramedic.",
    sections: [
      {
        icon: { src: "/images/placeholder.svg", alt: "Certified icon" },
        heading: "Certified",
        description: "Passed state paramedic certification on his first attempt.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Employed icon" },
        heading: "Employed",
        description: "Hired full-time within weeks of finishing the program.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Advancing icon" },
        heading: "Advancing",
        description: "Now mentoring newer students coming through the same program.",
      },
    ],
    buttons: [{ title: "Start your own story" }],
  },
  content2: {
    heading: "In Greg's words",
    body: "\"I didn't think I could change careers at 34 with a family to support. Midwest EMS Academy's schedule worked around my warehouse shifts, and within a year I was a certified paramedic. I wish I'd started sooner.\"",
    image: { src: "/images/placeholder.svg", alt: "Greg on an ambulance call" },
  },
  testimonial19: {
    heading: "Hear from Greg",
    description: "A real student, a real career change.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "I didn't think I could change careers at 34 with a family to support. This program worked around my warehouse shifts, and within a year I was a certified paramedic.",
        avatar: { src: "/images/placeholder.svg", alt: "Greg" },
        name: "Greg",
        position: "Paramedic",
        companyName: "Midwest EMS Academy Graduate",
      },
    ],
  },
  faqBanner: {
    heading: "Questions about changing careers into EMS",
    description:
      "Answers to what students in Greg's position ask most before enrolling.",
    questions: [
      {
        title: "Can I keep working while I train, like Greg did?",
        answer:
          "Yes — the paramedic program is built around evening and weekend cohorts so you can keep your current job while you train.",
      },
      {
        title: "How long does it take to become a certified paramedic?",
        answer:
          "Most students, like Greg, complete certification in under a year, depending on the track and prior EMT experience.",
      },
      {
        title: "What does the program cost?",
        answer:
          "Tuition and financing options vary by track — an admissions advisor can walk you through cost and financial aid.",
      },
      {
        title: "Will I get help finding a job after certification?",
        answer:
          "Yes — the academy connects graduates with hiring partners, which is how Greg was placed within weeks of finishing.",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "Ready to start your own story?",
    description: "Greg changed careers in under a year. See what the paramedic program could do for you.",
    buttons: [{ title: "Explore the paramedic program" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Paramedic students training" },
      { src: "/images/placeholder.svg", alt: "Paramedic on an emergency call" },
      { src: "/images/placeholder.svg", alt: "Paramedic academy graduation" },
    ],
  },
};
