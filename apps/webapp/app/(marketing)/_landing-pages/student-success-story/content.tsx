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
    heading: "EMT in 12 weeks, not 4 years",
    description:
      "While his friends headed off to four-year colleges, Greg chose a faster, more direct path. In just 3 months at Midwest EMS Academy, he earned his EMT certification and launched the career of his dreams — without the years of school or the student debt.",
    button: { title: "Enroll today" },
    backgroundImage: { src: "/images/emt-hero.avif", alt: "Greg in EMS uniform" },
    foregroundImage: { src: "/images/emt-compressions.avif", alt: "Greg on shift with his crew" },
  },
  layout1A: {
    heading: "Accelerated path to EMS",
    description:
      "Become job-ready in months, not years. Midwest EMS Academy's EMT program can be completed in roughly 12 weeks, so you can start saving lives now instead of sitting in a classroom until some distant graduation date.",
    button: { title: "Explore programs" },
    image: { src: "/images/student-studying.png", alt: "Greg reviewing his class schedule" },
    imagePosition: "left",
  },
  comparison6: {
    tagline: "See how we compare",
    heading: "Affordable hands-on training",
    description:
      "Quality EMS training at a fraction of the cost of a college degree. Our programs won't bury you in debt. Plus, we offer flexible payment plans so you can invest in your future without financial strain.",
    competitorName: "Local college program",
    baseTuition: { midwestEa: "$1,800", competitor: "$3,600" },
    costRows: [
      { label: "Books", midwestEa: "$50", competitor: "$300" },
      { label: "Supplies", midwestEa: "Included", competitor: "$500" },
      { label: "Certification fee", midwestEa: "N/A", competitor: "$25" },
      { label: "Materials", midwestEa: "Included", competitor: "$125" },
      { label: "Insurance", midwestEa: "N/A", competitor: "$60" },
    ],
    totalCost: { midwestEa: "$1,850", competitor: "$4,610" },
    button: { title: "Register today to lock in your price" },
  },
  layout1B: {
    heading: "Hands-on training, real skills",
    description:
      "From day one, you'll train with real equipment and scenarios. No endless prereqs or unrelated courses; every lesson is focused on emergency care and preparing you for the field.",
    button: { title: "See the paramedic curriculum" },
    image: { src: "/images/cpr2.avif", alt: "Greg in hands-on paramedic training" },
    imagePosition: "right",
  },
  layout1C: {
    heading: "Focused on certification & career",
    description:
      "We teach exactly what you need to pass your NREMT certification and excel as an EMT. No filler, no time wasted. Our expert instructors coach you through exams, and our reputation in the EMS community means you'll have a strong foundation when seeking a job.",
    checklist: ["Exam preparation", "Community involvement", "Career placement"],
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
    heading: "Greg's story",
    image: { src: "/images/ems.avif", alt: "Greg on an ambulance call" },
    body: (
      <>
        <p className="mea-body-md">
          Greg always knew he wanted a career helping others, but the prospect of spending four
          years in college (and taking on a mountain of debt) just didn&apos;t feel right.{" "}
          <strong>
            &ldquo;I didn&apos;t want to spend years in a classroom before actually saving
            lives,&rdquo;
          </strong>{" "}
          Greg says. After high school, he took a leap and enrolled in Midwest EMS Academy&apos;s
          12-week EMT program. It turned out to be the best decision of his life.
        </p>
        <p className="mea-body-md">
          From day one, Greg was immersed in real training. He wasn&apos;t sitting in a huge
          lecture hall learning abstract theory; he was in a small, hands-on class practicing how
          to stop bleeding, perform CPR, and manage real emergency scenarios.{" "}
          <strong>The instructors knew him by name</strong> and took extra time to make sure he
          grasped each skill. &ldquo;It was so engaging. I learned more in three months here than I
          think I would have in two years of general college classes,&rdquo; he recalls.
        </p>
        <p className="mea-body-md">
          When the 12 weeks were up, Greg had earned his EMT certification. He studied hard and,
          with Midwest EMS Academy&apos;s preparation,{" "}
          <strong>passed the NREMT exam on his first attempt</strong>. Just a few weeks later —
          while some of his high school friends were still picking college majors — Greg started
          his new job as a full-time EMT with a local ambulance service. He was 19 years old, out
          in the real world, <strong>making a difference every day</strong>.
        </p>
        <p className="mea-body-md">
          That was a year ago. Now Greg has responded to dozens of 911 calls, from helping car
          crash victims to reviving heart attack patients. &ldquo;I love my job and I&apos;m proud
          of the path I chose,&rdquo; he says. &ldquo;Midwest EMS Academy gave me the head start I
          needed. Instead of sitting in a dorm room, I&apos;m out here doing what I was meant to
          do.&rdquo;
        </p>
        <p className="mea-body-md">
          Greg&apos;s story is proof that college isn&apos;t the only path to success. His advice
          to others: &ldquo;If you&apos;re serious about EMS, don&apos;t wait four years to start.
          Do it now.&rdquo;
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
  faqBanner: {
    heading: "Questions about changing careers into EMS",
    description: "Answers to what students in Greg's position ask most before enrolling.",
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
    button: { title: "Explore the paramedic program" },
  },
};
