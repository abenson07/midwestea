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

export const marcusStoryContent: StudentSuccessStoryContent = {
  header137: {
    kicker: "Meet Marcus",
    heading: "Marcus went from warehouse shifts to the back of an ambulance — in 12 weeks.",
    description:
      "No degree. No years of prerequisites. Just one hybrid program and a decision to start.",
    button: { title: "Start Your EMT Journey" },
    backgroundImage: { src: "/images/emt-hero.avif", alt: "Marcus in EMS uniform" },
    foregroundImage: { src: "/images/emt-compressions.avif", alt: "Marcus on shift with his crew" },
  },
  layout1A: {
    heading: "Where Marcus started",
    description:
      "Marcus spent six years running the overnight shift at a distribution warehouse outside Raytown. The pay was fine. The work wasn't. He'd clocked in every night telling himself \"next year\" — next year he'd figure out what came next. A coworker's cardiac arrest on the floor, and the EMTs who worked on him until the ambulance arrived, is what finally moved \"next year\" to \"now.\" Marcus had no medical background, a GED, and a family depending on his paycheck. He didn't have four years to give a college degree.",
    button: { title: "Explore programs" },
    image: { src: "/images/student-studying.png", alt: "Marcus reviewing his class schedule" },
    imagePosition: "left",
  },
  comparison6: {
    tagline: "Before vs. after",
    heading: "From warehouse shift lead to certified EMT",
    description: "A side-by-side look at what changed for Marcus once he certified as an EMT.",
    competitorName: "Before",
    baseTuition: { midwestEa: "$2,150", competitor: "—" },
    costRows: [
      { label: "Schedule", midwestEa: "Hybrid online + set in-person skills days", competitor: "Rotating nights, no control" },
      { label: "Credential", midwestEa: "NREMT-certified, state-licensed EMT", competitor: "None" },
      { label: "Total cost", midwestEa: "$2,150", competitor: "~$4,610 equivalent at a local college program" },
      { label: "Trajectory", midwestEa: "First EMS job within weeks of certifying, AEMT/Paramedic pathway open", competitor: "Same job, indefinitely" },
    ],
    totalCost: { midwestEa: "$2,150", competitor: "~$4,610" },
    button: { title: "Enroll in EMT Training Today" },
  },
  layout1B: {
    heading: "Why Marcus chose this program",
    description:
      "Marcus looked at a community college EMS program first — 14+ weeks, a fixed daytime class schedule that meant quitting his job to attend, and total cost north of $4,500 once books, materials, and fees were added in. Midwest EMS Academy's hybrid format let him keep working nights while doing coursework online and only needing to show up in person for skills days. At $2,150 all-in, it was less than half the cost, with a faster path to a paycheck.",
    button: { title: "See the EMT curriculum" },
    image: { src: "/images/emt-compressions.avif", alt: "Marcus in hands-on EMT training" },
    imagePosition: "right",
  },
  layout1C: {
    heading: "What training was actually like",
    description:
      "The online modules covered anatomy, patient assessment, and emergency protocols — Marcus worked through them between shifts and on weekends. Skills days were where it got real: full-arrest scenarios on mannequins, splinting and bleeding control on classmates, ride-alongs that put him in the back of a real rig for the first time. His instructors were working EMTs and paramedics, not lecturers reading slides — when Marcus froze on his first scenario, his instructor walked him through it step by step instead of moving on without him.",
    checklist: [
      "Passed the NREMT exam on his first attempt",
      "Certified EMT in just under 3 months from his first class",
      "Hired by a local ambulance service within 3 weeks of certifying",
    ],
    image: { src: "/images/emt.avif", alt: "Marcus reviewing certification materials" },
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
    heading: "In Marcus's own words",
    image: { src: "/images/ems.avif", alt: "Marcus on an ambulance call" },
    body: (
      <>
        <p className="mea-body-md">
          <strong>
            &ldquo;I didn&apos;t tell anyone at work I was doing this until I passed.&rdquo;
          </strong>{" "}
          Marcus spent six years running the overnight shift at a distribution warehouse. A
          coworker&apos;s cardiac arrest on the floor, and the EMTs who worked on him until the
          ambulance arrived, is what finally moved &ldquo;next year&rdquo; to &ldquo;now.&rdquo;
          He had no medical background, a GED, and a family depending on his paycheck.
        </p>
        <p className="mea-body-md">
          Midwest EMS Academy&apos;s hybrid format let him keep working nights while doing
          coursework online, only showing up in person for skills days.{" "}
          <strong>
            &ldquo;I didn&apos;t want to have to explain it if I quit halfway through. I never
            quit.&rdquo;
          </strong>{" "}
          His instructors were working EMTs and paramedics — when Marcus froze on his first
          scenario, his instructor walked him through it step by step instead of moving on without
          him.
        </p>
        <p className="mea-body-md">
          Marcus passed the NREMT exam on his first attempt and was hired by a local ambulance
          service within three weeks of certifying.{" "}
          <strong>
            &ldquo;Three months ago I was pulling pallets. Now I&apos;m doing compressions on real
            people and it matters every single time.&rdquo;
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
          "Midwest EMS Academy's training gave me the skills and confidence I needed. I passed the NREMT exam on the first try and felt prepared for real emergencies from day one on the job.",
        avatar: { src: "/images/instructors/Brower.jpg", alt: "Marcus S." },
        name: "Marcus S.",
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
  faqBanner: {
    heading: "Questions about starting an EMS career",
    description: "Answers to what career-changers in Marcus's position ask most before enrolling.",
    questions: [
      {
        title: "Am I too old to start an EMT career?",
        answer:
          "Not at all. Our students range from their 20s to their 50s. If you meet the basic requirements (18 or older, high school diploma/GED), age isn't a barrier — commitment is what matters.",
      },
      {
        title: "How does the cost compare to a college program?",
        answer:
          "Midwest EMS Academy's EMT program runs $2,150 total. A comparable local college program runs closer to $4,600 once books, supplies, and fees are added in.",
      },
      {
        title: "Can I really keep my job while I do this?",
        answer:
          "Yes — that's the point of the hybrid format. Coursework is online and self-paced within deadlines; only skills days require you to be in person, and we offer multiple schedule options.",
      },
      {
        title: "What if I want to advance to AEMT or Paramedic later?",
        answer:
          "EMT is the foundation for every advanced track we offer. Most of our AEMT and Paramedic students started exactly where you are now.",
      },
    ],
    button: { title: "Talk to admissions" },
  },
  header108: {
    title: "You don't need four years and a mountain of debt. You need 12 weeks and a decision.",
    description: "Marcus certified as an EMT in under 3 months. See what the EMT program could do for you.",
    button: { title: "Enroll in EMT Training Today" },
  },
};
