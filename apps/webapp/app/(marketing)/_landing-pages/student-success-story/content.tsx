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

export const gregStoryContent: StudentSuccessStoryContent = {
  header137: {
    kicker: "Meet Greg",
    heading: "From warehouse shifts to lead paramedic on his own rig",
    description:
      "Greg made the jump without ever setting foot on a four-year campus. From his first EMT class to full paramedic scope, one accredited program built the whole ladder.",
    button: { title: "Start the Paramedic Program" },
    backgroundImage: { src: "/images/paramedic-1.avif", alt: "Greg in EMS uniform" },
    foregroundImage: { src: "/images/paramedic.avif", alt: "Greg on shift with his crew" },
  },
  layout1A: {
    heading: "Where Greg started",
    description:
      "Three years ago, Greg was working overnight shifts in a warehouse with no clear next step. He got his start with Midwest EMS Academy's 12-week EMT program, certified, and got hired fast — but a year into EMS work, he kept hitting the same wall AEMTs and EMTs hit every shift: waiting on a paramedic to arrive before certain calls could really move forward. He wanted to be the one making the call.",
    button: { title: "Explore programs" },
    image: { src: "/images/student-studying.png", alt: "Greg reviewing his class schedule" },
    imagePosition: "left",
  },
  comparison6: {
    tagline: "Before vs. after",
    heading: "From EMT to lead paramedic",
    description: "A side-by-side look at what changed for Greg once he advanced to paramedic.",
    competitorName: "Before (EMT)",
    baseTuition: { midwestEa: "$8,800", competitor: "$2,150" },
    costRows: [
      { label: "Scope", midwestEa: "Cardiac rhythm interpretation, full pharmacology, advanced airway, lead clinical decisions", competitor: "BLS / limited ALS support" },
      { label: "Training", midwestEa: "12 months, CAAHEP-accredited, 1 class day/week", competitor: "12 weeks" },
      { label: "Credential", midwestEa: "State license + CAAHEP accreditation + 30 college credit hours", competitor: "State EMT license" },
      { label: "Certifications earned", midwestEa: "BLS, ACLS, PALS, PHTLS, AMLS", competitor: "Basic" },
    ],
    totalCost: { midwestEa: "$8,800", competitor: "$2,150" },
    button: { title: "Apply to the Paramedic Program" },
  },
  layout1B: {
    heading: "Why Greg chose this program",
    description:
      "Greg wanted a program that would actually be respected — by employers, by hospitals, by the state. Midwest EMS Academy's paramedic program is state-approved and CAAHEP-accredited, with 30 college credit hours through North Central Missouri College built in, so his training counted toward something beyond a certificate. The one-day-a-week class schedule (Monday or Tuesday, based on his shift) meant he didn't have to leave his EMT job to become a paramedic.",
    button: { title: "See the paramedic curriculum" },
    image: { src: "/images/cpr2.avif", alt: "Greg in hands-on paramedic training" },
    imagePosition: "right",
  },
  layout1C: {
    heading: "What training was actually like",
    description:
      "Twelve months, one class day a week, plus hospital rotations and a field internship where Greg worked real calls under a preceptor's supervision. Coursework went deep — cardiac rhythm interpretation, pharmacology, advanced airway management — building toward the moment he'd be the one running a cardiac arrest instead of assisting one. The internship was the turning point: the first time he called the shots on scene and it worked.",
    checklist: [
      "CAAHEP-accredited certification, plus 30 college credit hours",
      "Certified in BLS, ACLS, PALS, PHTLS, and AMLS",
      "Promoted to lead paramedic within months of certifying",
    ],
    image: { src: "/images/emt.avif", alt: "Greg reviewing certification materials" },
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
    heading: "In Greg's own words",
    image: { src: "/images/ems.avif", alt: "Greg on an ambulance call" },
    body: (
      <>
        <p className="mea-body-md">
          <strong>
            &ldquo;People ask if I regret not going to a four-year school. I don&apos;t.&rdquo;
          </strong>{" "}
          Greg spent three years working overnight shifts in a warehouse before he ever set foot
          in a classroom. He got his start with Midwest EMS Academy&apos;s 12-week EMT program,
          certified, and got hired fast — but a year into EMS work, he kept hitting the same wall
          EMTs hit every shift: waiting on a paramedic to arrive before certain calls could really
          move forward. He wanted to be the one making the call.
        </p>
        <p className="mea-body-md">
          Greg wanted a program that would actually be respected — by employers, by hospitals, by
          the state. Midwest EMS Academy&apos;s paramedic program is state-approved{" "}
          <strong>and</strong> CAAHEP-accredited, with 30 college credit hours through North
          Central Missouri College built in, so his training counted toward something beyond a
          certificate. The one-day-a-week class schedule meant he didn&apos;t have to leave his
          EMT job to become a paramedic.
        </p>
        <p className="mea-body-md">
          Twelve months, one class day a week, plus hospital rotations and a field internship
          where Greg worked real calls under a preceptor&apos;s supervision.{" "}
          <strong>
            &ldquo;The hospital rotations and the internship were the hardest part — and the most
            important. That&apos;s where I actually became a paramedic, not just someone who
            passed a test.&rdquo;
          </strong>
        </p>
        <p className="mea-body-md">
          Greg was promoted to lead paramedic on his rig within months of certifying —{" "}
          <strong>full autonomy on scene, no longer waiting on someone else to arrive.</strong>{" "}
          &ldquo;I have a real accredited credential, college credit, and I&apos;m running my own
          rig,&rdquo; he says.
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
          "Midwest EMS Academy's paramedic program gave me the clinical depth and the credentials to be trusted running my own calls. The accreditation and college credit made it worth every class day.",
        avatar: { src: "/images/instructors/Brower.jpg", alt: "Greg T." },
        name: "Greg T.",
        position: "Lead Paramedic",
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
  faqBanner: {
    heading: "Questions about advancing to paramedic",
    description: "Answers to what working EMTs in Greg's position ask most before enrolling.",
    questions: [
      {
        title: "Is this a \"real\" accredited credential, or just a certificate?",
        answer:
          "It's both state-approved and CAAHEP-accredited — the same accreditation standard used by college-based paramedic programs — plus 30 transferable college credit hours through North Central Missouri College.",
      },
      {
        title: "Can I work full-time as an EMT while doing this?",
        answer:
          "Yes — one class day a week (Monday or Tuesday, based on shift) is built specifically for working EMTs and AEMTs.",
      },
      {
        title: "What does the hands-on part actually involve?",
        answer:
          "Hospital rotations and a field internship where you work real calls under supervision — not just simulations.",
      },
      {
        title: "What's the total cost and payment structure?",
        answer:
          "$8,800 total, with a three-payment plan ($300 registration + $1,000 + $1,000, remaining balance structured across the program).",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "From first responder to lead paramedic — one accredited program, no four-year detour.",
    description: "Greg advanced from EMT to lead paramedic. See what the paramedic program could do for you.",
    button: { title: "Apply to the Paramedic Program" },
  },
};
