import type { Header108Props } from "./components/header-108";
import type { Header108BProps } from "./components/header-108-b";
import type { Header108CProps } from "./components/header-108-c";
import type { Layout1Props } from "./components/layout-1";
import type { Layout1BProps } from "./components/layout-1-b";
import type { Layout48Props } from "./components/layout-48";
import type { Layout241Props } from "./components/layout-241";
import type { Comparison6Props } from "./components/comparison-6";
import type { Content12Props } from "./components/content-12";
import type { Testimonial19Props } from "./components/testimonial-19";
import type { Cta25Props } from "./components/cta-25";
import type { Faq6Props } from "@/components/marketing/faq-6";

export type CareerChangerAdultLearnerContent = {
  header108A: Header108Props;
  header108B: Header108BProps;
  layout1A: Layout1Props;
  layout48: Layout48Props;
  layout241: Layout241Props;
  layout1B: Layout1BProps;
  comparison6: Comparison6Props;
  content12: Omit<Content12Props, "children"> & { body: string };
  testimonial19: Testimonial19Props;
  cta25: Cta25Props;
  faqBanner: Faq6Props;
  header108C: Header108CProps;
};

export const careerChangerContent: CareerChangerAdultLearnerContent = {
  header108A: {
    title: "It's not too late to start an EMS career.",
    description:
      "Midwest EMS Academy helps working adults change careers into EMS, without pausing life to do it.",
    buttons: [{ title: "Explore your path to certification" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Adult student in EMT training" },
      { src: "/images/placeholder.svg", alt: "Adult student on a training call" },
      { src: "/images/placeholder.svg", alt: "Adult learner graduating" },
    ],
  },
  header108B: {
    title: "No medical background required.",
    description:
      "Most students start with no prior medical experience. Our programs are built to take you from zero to certified.",
    buttons: [{ title: "See what a typical week looks like" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Student in first EMT class" },
      { src: "/images/placeholder.svg", alt: "Instructor guiding a new student" },
      { src: "/images/placeholder.svg", alt: "Student practicing hands-on skills" },
    ],
  },
  layout1A: {
    tagline: "Flexible scheduling",
    heading: "Training that fits around your job and family",
    description:
      "Evening and weekend cohorts let working adults train without quitting their current job.",
    buttons: [{ title: "See the schedule", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Adult learner studying in the evening" },
  },
  layout48: {
    heading: "What holds career changers back — and how we handle it",
    description:
      "The concerns we hear most from adult learners, and how the program is built to address each one.",
    subHeadings: [
      { title: "\"I'm too old to start over.\"", description: "Most of our EMT/paramedic students are career changers in their 30s and 40s." },
      { title: "\"I don't have time.\"", description: "Evening and weekend cohorts are built around working adults' schedules." },
      { title: "\"I can't afford it.\"", description: "Financial aid and payment plan options are available for qualifying students." },
    ],
  },
  layout241: {
    tagline: "The path",
    heading: "How career changers get certified",
    description: "A clear, structured path from enrollment to your first EMS job.",
    sections: [
      {
        icon: { src: "/images/placeholder.svg", alt: "Enroll icon" },
        heading: "Enroll",
        description: "Start with no prior medical experience required.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Train icon" },
        heading: "Train",
        description: "Evening and weekend classes fit around your current job.",
      },
      {
        icon: { src: "/images/placeholder.svg", alt: "Certify icon" },
        heading: "Get hired",
        description: "Graduate certified and connected to hiring partners.",
      },
    ],
    buttons: [{ title: "Start your path" }],
  },
  layout1B: {
    tagline: "Hands-on training",
    heading: "Learn in a real training environment",
    description:
      "Adult learners train hands-on with working EMS instructors, not just in a classroom.",
    buttons: [{ title: "See the training facilities", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Hands-on EMS training session" },
  },
  comparison6: {
    tagline: "EMT vs. Paramedic",
    heading: "Which track fits your career change?",
    description: "Two tracks, both open to career changers with no prior medical background.",
    pricingPlans: [
      {
        planName: "EMT",
        monthlyPrice: "Faster start",
        description: "Shorter program, quicker path to entry-level EMS work.",
        button: { title: "Explore EMT", variant: "secondary" },
      },
      {
        planName: "Paramedic",
        monthlyPrice: "Advanced role",
        description: "Longer program, broader scope of practice and pay.",
        button: { title: "Explore paramedic" },
      },
    ],
    featureCategories: [
      {
        title: "What career changers ask about",
        features: [
          { text: "No prior medical background needed", items: ["Yes", "Yes"] },
          { text: "Evening/weekend scheduling", items: ["Yes", "Yes"] },
        ],
      },
    ],
    buttons: [{ title: "Talk to an advisor" }],
  },
  content12: {
    body: "Changing careers as an adult learner comes with real questions — about time, cost, and whether it's too late to start. Our advisors work one-on-one with career changers to map out a realistic schedule and funding plan before you enroll.",
    metatags: [
      { title: "Career Changers", description: "No prior medical background required" },
      { title: "Flexible Scheduling", description: "Evening and weekend cohorts" },
    ],
  },
  testimonial19: {
    heading: "Hear from a career changer",
    description: "A real adult learner who changed careers into EMS.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "I was 38 with no medical background and thought it was too late. The evening classes let me keep my job while I trained, and I was certified within a year.",
        avatar: { src: "/images/placeholder.svg", alt: "Adult learner graduate" },
        name: "Program Graduate",
        position: "EMT",
        companyName: "Midwest EMS Academy Graduate",
      },
    ],
  },
  cta25: {
    heading: "Ready to start your new career?",
    description: "Talk to an advisor about scheduling, cost, and next steps.",
    buttons: [{ title: "Request program info" }],
  },
  faqBanner: {
    heading: "Questions from adult learners and career changers",
    description: "What working adults ask most before enrolling.",
    questions: [
      {
        title: "Do I need any prior medical experience?",
        answer: "No — most students start with no prior medical background.",
      },
      {
        title: "Can I keep working while I train?",
        answer: "Yes — evening and weekend cohorts are built for working adults.",
      },
      {
        title: "Is financial aid available?",
        answer: "Financial aid and payment plans are available for qualifying students.",
      },
      {
        title: "How long does certification take?",
        answer: "It depends on the track — an advisor can map out a realistic timeline for you.",
      },
    ],
    button: { title: "Talk to an advisor" },
  },
  header108C: {
    title: "Your next career starts here.",
    description: "Join the working adults who've already made the change into EMS.",
    buttons: [{ title: "Request program info" }],
    images: [
      { src: "/images/placeholder.svg", alt: "Career changer graduate" },
      { src: "/images/placeholder.svg", alt: "New EMT on the job" },
      { src: "/images/placeholder.svg", alt: "Graduation ceremony" },
    ],
  },
};
