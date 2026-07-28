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
    heading: "State-approved & nationally recognized",
    description:
      "Train with confidence in a program approved by the state and accepted by the NREMT — a paramedic certification your department can stand behind, wherever your crew goes next.",
    image: { src: "/images/paramedic.png", alt: "Certified paramedic on duty" },
    imagePosition: "right",
  },
  layout1B: {
    heading: "Flexible schedule options",
    description:
      "Life is busy, we get it. That's why we offer evening/weekend classes and hybrid online learning. Train for a new career without upending your current routine or responsibilities.",
    checklist: ["Flexible scheduling", "Online learning", "Personalized support"],
    button: { title: "Explore online courses" },
    image: { src: "/images/online.avif", alt: "Firefighter reviewing a class schedule online" },
    imagePosition: "left",
  },
  layout1C: {
    heading: "Hands-on training, real skills",
    description:
      "From day one, you'll train with real equipment and scenarios. No endless prereqs or unrelated courses; every lesson is focused on emergency care and preparing you for the field.",
    image: { src: "/images/group-care.avif", alt: "Crew training together on real equipment" },
    imagePosition: "right",
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
    tagline: "Fire, EMS, and More",
    heading: "Proven by Departments",
    description:
      "From small volunteer squads to big city firehouses, we've helped teams stay current and rescue-ready. Join a growing community of leaders who make Midwest EMS Academy an integral part of their training program.",
    sections: [
      {
        icon: { src: "/images/landing-pages/book_ribbon.svg", alt: "Book ribbon icon" },
        heading: "One-on-one tutoring",
        description: "Need help with a skill or prepping for the NREMT exam? Our team has your back.",
      },
      {
        icon: { src: "/images/landing-pages/ink_pen.svg", alt: "Ink pen icon" },
        heading: "In-depth study guides",
        description: "Stuck on a tough topic? Our detailed study guides make test prep a breeze.",
      },
      {
        icon: { src: "/images/landing-pages/handshake.svg", alt: "Handshake icon" },
        heading: "Community of peers",
        description: "Connect with fellow students in study groups for advice and support.",
      },
    ],
  },
  content12: {
    body: "We work directly with training officers and station chiefs to schedule cohorts, coordinate tuition assistance conversations, and track certification progress for the whole crew — not just one recruit at a time.",
    metatags: [
      { title: "Department Partnerships", description: "Group enrollment support" },
      { title: "Tuition Assistance", description: "Guidance for department funding conversations" },
    ],
  },
  testimonial19: {
    heading: "Customer stories",
    description: "Our dedication to exceeding expectations is apparent with each customer interaction.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "Midwest EMS Academy's training gave me the skills and confidence I needed. I passed the NREMT exam on the first try and felt prepared for real emergencies from day one on the job.",
        avatar: { src: "/images/instructors/Brower.jpg", alt: "Emily S." },
        name: "Emily S.",
        position: "Certified EMT",
        companyName: "Program Graduate",
      },
      {
        numberOfStars: 5,
        quote:
          "As a working mom, I appreciated Midwest EMS Academy's flexible schedule. I studied online after work and joined hands-on sessions on weekends. I never felt overwhelmed, and now I'm a certified paramedic.",
        avatar: { src: "/images/instructors/Crawford.jpg", alt: "Sarah L." },
        name: "Sarah L.",
        position: "Paramedic",
        companyName: "Program Graduate",
      },
      {
        numberOfStars: 5,
        quote:
          "Our entire fire department uses Midwest EMS Academy for continuing education. The online courses make recertification simple, and we trust the quality. It keeps our team sharp.",
        avatar: { src: "/images/instructors/Hajmohammad.jpg", alt: "Mark D." },
        name: "Mark D.",
        position: "Fire Chief",
        companyName: "Department Partner",
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
    description: "Give your crew a clear, accredited path to paramedic certification.",
    button: { title: "Talk to admissions" },
  },
};
