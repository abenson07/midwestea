import type { ReactNode } from "react";
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
  content2: Omit<Content2Props, "children"> & { body: ReactNode };
  testimonial19: Testimonial19Props;
  faqBanner: Faq6Props;
  header108: Header108Props;
};

export const priyaStoryContent: StudentSuccessStoryContent = {
  header137: {
    kicker: "Meet Priya",
    heading: "Priya was already running calls as an EMT. AEMT gave her the scope to match her experience.",
    description:
      "For EMTs ready to stop hitting the ceiling of their own certification.",
    button: { title: "Level Up to AEMT" },
    backgroundImage: { src: "/images/iv.avif", alt: "Priya starting an IV in the field" },
    foregroundImage: { src: "/images/emt-compressions.avif", alt: "Priya on a call with her crew" },
  },
  layout1A: {
    heading: "Where Priya started",
    description:
      "Priya had been a full-time EMT for three years, working a busy 911 service in the KC metro. She knew her protocols cold and had trained newer EMTs herself — but she was capping out. Every call where a patient needed an IV or advanced airway management, she had to wait for a paramedic to catch up or hand off. She loved the work; she just wanted to be able to do more of it herself.",
    button: { title: "Explore programs" },
    image: { src: "/images/student-studying.png", alt: "Priya reviewing her class schedule" },
    imagePosition: "left",
  },
  comparison6: {
    tagline: "Before vs. after",
    heading: "From EMT to AEMT",
    description: "A side-by-side look at what changed for Priya once she advanced to AEMT.",
    competitorName: "Before (EMT)",
    baseTuition: { midwestEa: "$5,600", competitor: "—" },
    costRows: [
      { label: "Scope", midwestEa: "IV/IO access, expanded medication administration, advanced airway skills", competitor: "BLS only" },
      { label: "On-scene role", midwestEa: "Handling more of the call directly", competitor: "Support, hand-off to medic" },
      { label: "Training", midwestEa: "12 weeks, in-person 2 days/week", competitor: "—" },
      { label: "Pay trajectory", midwestEa: "Meaningful step up, closer to paramedic pay", competitor: "Capped at EMT scale" },
    ],
    totalCost: { midwestEa: "$5,600", competitor: "—" },
    button: { title: "Start Your AEMT Program" },
  },
  layout1B: {
    heading: "Why Priya chose this program",
    description:
      "Priya couldn't take 12 weeks off shift work, so the two-day-a-week in-person format — with the same material taught both days so she could pick whichever fit her rotation — was the deciding factor. Orientation in Topeka gave her a clear start date to plan around, and the program was explicitly built on the EMT foundation she already had rather than starting her over from scratch.",
    button: { title: "See the AEMT curriculum" },
    image: { src: "/images/iv.avif", alt: "Priya in hands-on AEMT training" },
    imagePosition: "right",
  },
  layout1C: {
    heading: "What training was actually like",
    description:
      "Because Priya already had field experience, the AEMT coursework moved fast into what mattered to her: IV and IO access, a broader medication formulary, and advanced airway techniques she'd been watching medics do for years. Skills days were hands-on and scenario-heavy — practicing IV starts under time pressure, running mock calls where she was now the one making the call on medication administration instead of waiting for someone else to.",
    checklist: [
      "AEMT-certified in 12 weeks without leaving her job",
      "Now handling IV therapy, expanded medications, and advanced airway management on calls",
      "Considering the Paramedic bridge as her next step",
    ],
    image: { src: "/images/emt.avif", alt: "Priya reviewing certification materials" },
    imagePosition: "left",
  },
  layout241: {
    tagline: "Tagline",
    heading: "Supporting you every step of the way",
    description:
      "With Midwest EMS Academy, you get everything you need to succeed – credible training, experienced mentors, and a learning experience that leaves you confident for Day One in the field.",
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
  content2: {
    heading: "In Priya's own words",
    image: { src: "/images/ems.avif", alt: "Priya on an ambulance call" },
    body: (
      <>
        <p className="mea-body-md">
          <strong>
            &ldquo;I wasn&apos;t new to this — I&apos;d been running calls for three
            years.&rdquo;
          </strong>{" "}
          Priya had been a full-time EMT for three years, working a busy 911 service in the KC
          metro. She knew her protocols cold and had trained newer EMTs herself — but every call
          where a patient needed an IV or advanced airway management, she had to wait for a
          paramedic to catch up or hand off.
        </p>
        <p className="mea-body-md">
          What she needed was a program that respected that experience and didn&apos;t waste her
          time starting from zero. The two-day-a-week in-person format — with the same material
          taught both days so she could pick whichever fit her rotation — let her train without
          leaving her job.{" "}
          <strong>
            &ldquo;AEMT gave me the skills to actually finish more of what I started on scene
            instead of handing it off.&rdquo;
          </strong>
        </p>
        <p className="mea-body-md">
          Skills days were hands-on and scenario-heavy — practicing IV starts under time pressure,
          running mock calls where she was now the one making the call on medication
          administration. Twelve weeks later, Priya was AEMT-certified, now handling IV therapy,
          expanded medications, and advanced airway management on every call —{" "}
          <strong>with a pay increase reflecting her expanded scope.</strong>
        </p>
      </>
    ),
  },
  testimonial19: {
    heading: "Customer stories",
    description: "Our dedication to exceeding expectations is apparent with each customer interaction.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "As a working EMT, I appreciated Midwest EMS Academy's flexible schedule. I studied online after work and joined hands-on sessions on weekends. I never felt overwhelmed, and now I'm a certified paramedic.",
        avatar: { src: "/images/instructors/Crawford.jpg", alt: "Sarah L." },
        name: "Sarah L.",
        position: "Paramedic",
        companyName: "Program Graduate",
      },
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
          "Our entire fire department uses Midwest EMS Academy for continuing education. The online courses make recertification simple, and we trust the quality. It keeps our team sharp.",
        avatar: { src: "/images/instructors/Hajmohammad.jpg", alt: "Mark D." },
        name: "Mark D.",
        position: "Fire Chief",
        companyName: "Department Partner",
      },
    ],
  },
  faqBanner: {
    heading: "Questions about advancing to AEMT",
    description: "Answers to what working EMTs in Priya's position ask most before enrolling.",
    questions: [
      {
        title: "I'm already working full-time as an EMT — can I actually fit this in?",
        answer:
          "Yes. AEMT is built for working EMTs: two in-person days a week with identical content, so you choose the day that fits your rotation.",
      },
      {
        title: "Is this worth it if I'm considering Paramedic eventually anyway?",
        answer:
          "AEMT is a real, standalone scope-of-practice upgrade with its own pay bump — and it's also the natural bridge into Paramedic when you're ready, not a detour.",
      },
      {
        title: "Do I have to redo EMT material I already know?",
        answer:
          "No. The program builds directly on your EMT foundation and moves into new scope — IV/IO, expanded medications, advanced airway.",
      },
      {
        title: "What's the real difference in what I'll be allowed to do?",
        answer:
          "AEMT adds IV and IO access, a broader medication set, and select advanced airway skills beyond EMT-Basic scope.",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "You've already proven you can handle the call. AEMT lets you handle more of it.",
    description: "Priya advanced from EMT to AEMT in 12 weeks. See what the AEMT program could do for you.",
    button: { title: "Start Your AEMT Program" },
  },
};
