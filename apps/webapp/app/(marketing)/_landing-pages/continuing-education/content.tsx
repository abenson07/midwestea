import type { ReactNode } from "react";
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
  content2: Omit<Content2Props, "children"> & { body: ReactNode };
  testimonial19: Testimonial19Props;
  cta25: Cta25Props;
  faqBanner: Faq6Props;
  header108: Header108Props;
};

export const continuingEducationContent: ContinuingEducationContent = {
  header137: {
    kicker: "Continuing Education",
    heading: "Stay Certified, Stay Sharp.",
    description:
      "Don't let a busy schedule put your EMT or Paramedic license at risk. Midwest EMS Academy offers a wide range of state-approved, on-demand continuing education courses. Complete your required refresher hours anytime, anywhere — and stay ready for the next call with the latest skills and knowledge.",
    button: { title: "Register now" },
    backgroundImage: {
      src: "/images/de80bb7dcfc1d675590d6c698e87dbeb_acls-p-1600.webp",
      alt: "Paramedic completing continuing education",
    },
    foregroundImage: {
      src: "/images/emt-compressions.avif",
      alt: "EMT reviewing recertification requirements",
    },
  },
  layout1A: {
    heading: "State-approved & nationally recognized",
    description:
      "Train with confidence in courses approved by the state and accepted by the NREMT — continuing education that keeps your certification legitimate and respected wherever you work.",
    image: { src: "/images/paramedic.png", alt: "Certified paramedic on duty" },
    imagePosition: "right",
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
    heading: "Broad course selection",
    description:
      "We offer a variety of online courses, covering everything from basic life support to advanced cardiac care. With hundreds of hours of content, you can find the courses you need to meet your requirements and expand your expertise.",
    button: { title: "Browse courses" },
    image: { src: "/images/online.avif", alt: "EMT browsing online course catalog" },
    imagePosition: "left",
  },
  layout1C: {
    heading: "Self-paced & flexible",
    description:
      "Take control of your learning. Our bite-sized modules let you start, pause, and resume on your schedule. Available 24/7 on any device — desktop, tablet, or phone.",
    image: { src: "/images/online2.avif", alt: "Paramedic studying on a tablet" },
    imagePosition: "right",
  },
  layout1D: {
    heading: "Stay sharp & up-to-date",
    description:
      "Continuing ed isn't just a requirement, it's an opportunity to refresh and expand your skills. Midwest EMS Academy's courses are developed by seasoned EMS professionals and updated regularly with the latest best practices.",
    button: { title: "Get started" },
    image: { src: "/images/de80bb7dcfc1d675590d6c698e87dbeb_acls-p-1600.webp", alt: "Paramedic practicing AED skills" },
    imagePosition: "left",
  },
  content2: {
    heading: "Mike's story",
    image: { src: "/images/paramedic-1.avif", alt: "Veteran paramedic Mike on shift" },
    body: (
      <>
        <p className="mea-body-md">
          Mike has been a paramedic for eleven years. Between his shifts and being a father of
          three, keeping up with continuing education always felt like one more thing on an
          already-full plate.
        </p>
        <p className="mea-body-md">
          When his recertification deadline started creeping up, Mike didn&apos;t want to sit
          through another in-person weekend course away from his kids. He signed up for Midwest
          EMS Academy&apos;s online Paramedic refresher bundle instead.
        </p>
        <p className="mea-body-md">
          He worked through the modules in short blocks — during lunch breaks at the station,
          after the kids were in bed, whenever he had twenty minutes to spare. Nothing about his
          schedule had to change.
        </p>
        <p className="mea-body-md">
          The material itself wasn&apos;t just a formality, either. The refresher covered updated
          protocols Mike hadn&apos;t seen since his last recert, and a few skills he&apos;d gotten
          rusty on without realizing it.
        </p>
        <p className="mea-body-md">
          He finished his required hours two weeks before his deadline, with his certification
          renewed and no missed shifts or missed family dinners along the way.
        </p>
        <p className="mea-body-md">
          &ldquo;I went in just trying to check a box,&rdquo; Mike says, &ldquo;but I came out
          sharper — so when the next emergency hits, you&apos;re ready.&rdquo;
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
    button: { title: "Browse CE courses" },
  },
};
