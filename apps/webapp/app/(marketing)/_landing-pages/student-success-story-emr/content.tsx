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

export const danaStoryContent: StudentSuccessStoryContent = {
  header137: {
    kicker: "Meet Dana",
    heading: "Dana was first responder to every practice-field injury for years — with no real training to back her up. EMR changed that in 7 weeks.",
    description:
      "A fast, affordable way to turn \"the person who always helps\" into someone who's actually certified to.",
    button: { title: "Get EMR Certified" },
    backgroundImage: { src: "/images/emr-hero.avif", alt: "Dana on the sidelines of a practice field" },
    foregroundImage: { src: "/images/aed.avif", alt: "Dana practicing with an AED" },
  },
  layout1A: {
    heading: "Where Dana started",
    description:
      "Dana had been a high school coach and part-time campus safety monitor for eight years. She'd been first on scene for concussions, a broken leg, and once a player who went into anaphylaxis — every time relying on instinct and a first-aid card from a weekend course years earlier. She wasn't looking to become a paramedic. She wanted to actually know what she was doing the next time it happened, and to have something real behind her name.",
    button: { title: "Explore programs" },
    image: { src: "/images/student-studying.png", alt: "Dana reviewing her class schedule" },
    imagePosition: "left",
  },
  comparison6: {
    tagline: "Before vs. after",
    heading: "From coach to EMR-certified",
    description: "A side-by-side look at what changed for Dana once she completed EMR training.",
    competitorName: "Before",
    baseTuition: { midwestEa: "$750", competitor: "—" },
    costRows: [
      { label: "Training", midwestEa: "47–50 hour EMR course, NREMT-aligned", competitor: "One-time first-aid card" },
      { label: "Confidence on scene", midwestEa: "Trained in patient assessment, bleeding control, airway management", competitor: "Instinct only" },
      { label: "Credential", midwestEa: "Two-year EMR certification", competitor: "None" },
      { label: "What's next", midwestEa: "Considering the EMT bridge to work on an ambulance", competitor: "—" },
    ],
    totalCost: { midwestEa: "$750", competitor: "—" },
    button: { title: "Enroll in EMR Training" },
  },
  layout1B: {
    heading: "Why Dana chose this program",
    description:
      "Dana wasn't ready to commit to a 12-week EMT program or leave her coaching job — she needed something that fit around practices and game days without asking her to reorganize her life. At $750 and under 14 weeks, Midwest EMS Academy's EMR course was built for exactly that: people in adjacent roles — coaches, security staff, lifeguards, workplace safety leads — who need real emergency training without becoming a full-time EMS provider.",
    button: { title: "See the EMR curriculum" },
    image: { src: "/images/childcare.avif", alt: "Dana in hands-on EMR training" },
    imagePosition: "right",
  },
  layout1C: {
    heading: "What training was actually like",
    description:
      "Classroom sessions covered the fundamentals — patient assessment, CPR, bleeding and shock management, basic airway care — taught by instructors who'd actually used these skills in the field. Hands-on sessions had Dana practicing on training mannequins and running scenarios with classmates: a \"collapsed player\" drill, a \"severe allergic reaction\" drill. It was the first training she'd ever had that felt like it was actually preparing her for the moment, not just checking a box.",
    checklist: [
      "EMR-certified in under 14 weeks",
      "Now the designated first responder at every practice and game, with real training behind it",
      "Certification recognized statewide for two years",
    ],
    image: { src: "/images/aed.avif", alt: "Dana reviewing certification materials" },
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
    heading: "In Dana's own words",
    image: { src: "/images/youth-programs.avif", alt: "Dana on the sidelines with her team" },
    body: (
      <>
        <p className="mea-body-md">
          <strong>
            &ldquo;I&apos;d been &lsquo;the person who helps&rsquo; for years without ever really
            being trained.&rdquo;
          </strong>{" "}
          Dana had been a high school coach and part-time campus safety monitor for eight years.
          She&apos;d been first on scene for concussions, a broken leg, and once a player who went
          into anaphylaxis — every time relying on instinct and a first-aid card from a weekend
          course years earlier.
        </p>
        <p className="mea-body-md">
          She wasn&apos;t ready to commit to a 12-week EMT program or leave her coaching job — she
          needed something that fit around practices and game days. At $750 and under 14 weeks,
          Midwest EMS Academy&apos;s EMR course was built for exactly that.{" "}
          <strong>
            &ldquo;This course didn&apos;t turn me into a paramedic — it didn&apos;t need to. It
            gave me the actual skills for the situations I already deal with.&rdquo;
          </strong>
        </p>
        <p className="mea-body-md">
          Classroom sessions covered patient assessment, CPR, and bleeding and shock management;
          hands-on sessions had her running scenarios like a &ldquo;collapsed player&rdquo; drill
          with classmates. Dana is now the designated first responder at every practice and
          game — and{" "}
          <strong>
            it made me want more. I&apos;m looking at the EMT program next.
          </strong>
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
          "Midwest EMS Academy's EMR course gave me real, usable skills in just a few weeks — not just a certificate, but the confidence that I'd know what to do.",
        avatar: { src: "/images/instructors/Crawford.jpg", alt: "Dana R." },
        name: "Dana R.",
        position: "EMR-Certified",
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
    heading: "Questions about EMR training",
    description: "Answers to what people in adjacent roles ask most before enrolling.",
    questions: [
      {
        title: "Is EMR enough if I want to work on an ambulance?",
        answer:
          "No — EMR is designed for people in adjacent roles (coaches, security, lifeguards, workplace safety) or as a first step before EMT. If ambulance work is the goal, EMT is the right starting point, and EMR is a strong on-ramp toward it.",
      },
      {
        title: "How much time does this actually take?",
        answer:
          "The course totals 47–50 hours over under 14 weeks, with a mix of classroom and hands-on sessions built around evenings and weekends.",
      },
      {
        title: "Do I need any medical background to start?",
        answer:
          "None. EMR is built for people coming from completely unrelated fields who need real emergency skills for a role they're already in.",
      },
      {
        title: "Can this lead somewhere bigger?",
        answer:
          "Yes. Many EMR grads go on to the EMT program once they've seen what emergency training is really like.",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "Be more than \"the person who helps.\" Be trained.",
    description: "Dana got EMR-certified in under 14 weeks. See what EMR training could do for you.",
    button: { title: "Enroll in EMR Training" },
  },
};
