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
    heading: "Calling all fire chiefs: give your whole crew a certification path, not just a class.",
    description: "Midwest EMS Academy trains, certifies, and advances your department — on your schedule, not ours.",
    buttons: [{ title: "Explore Department Programs" }],
    video: "https://www.youtube.com/embed/8DKLYsikxTs?si=Ch9W0KrDWWUiCMMW",
    image: {
      src: "/images/placeholder.svg",
      alt: "Station crew training together",
    },
  },
  layout1A: {
    heading: "Scheduling that fits how your crew actually works",
    description:
      "Your crew doesn't run a 9-to-5, and neither does Midwest EMS Academy. Our hybrid and flexible-schedule programs — online coursework plus set in-person skills days — are built around 24/48 rotations, not against them. Multiple cohort start dates and evening/weekend skills sessions mean you're not pulling people off shift or blowing your minimum-staffing numbers to get your department certified.",
    image: { src: "/images/firefighter.avif", alt: "Firefighter-EMT reviewing a class schedule on shift" },
    imagePosition: "right",
  },
  layout1B: {
    heading: "Accreditation the leader can vouch for",
    description:
      "When you recommend a training program to command staff or your own crew, your name is on it. Midwest EMS Academy is state-approved and, for paramedic-level training, CAAHEP-accredited — the same accreditation standard used by college-based EMS programs — with content aligned to NREMT and state licensure requirements. You can put this in front of your chief or your board without hesitation.",
    image: { src: "/images/paramedic.png", alt: "Certified paramedic on duty" },
    imagePosition: "left",
  },
  layout1C: {
    heading: "The career ladder this creates for your team",
    description:
      "Losing a good firefighter-EMT to a department with a clearer advancement path is one of the most preventable losses you'll deal with. Midwest EMS Academy's full ladder — EMR → EMT → AEMT → Paramedic → Community Paramedic — gives you a real answer when someone asks \"what's next for me here?\" A visible path to advance is one of the strongest retention tools available to a department, at a fraction of the cost of replacing someone who leaves for one.",
    image: { src: "/images/group-care.avif", alt: "Crew training together on real equipment" },
    imagePosition: "right",
  },
  layout141: {
    tagline: "Department partnerships",
    heading: "How a department partnership actually works",
    description:
      "Group enrollment is built for departments, not individuals: a single point of contact coordinates cohort scheduling around your shift calendar, tracks who's enrolled in what, and works with you on tuition assistance options — including SAFER, AFG, WIOA, and, in Kansas, the KBEMS Education Incentive Grant, which your department can apply for on behalf of your staff. You tell us your staffing constraints; we build the cohort around them.",
    buttons: [{ title: "Talk to Admissions About Group Enrollment", variant: "secondary" }],
    image: { src: "/images/placeholder.svg", alt: "Training officer meeting with academy staff" },
  },
  layout241: {
    tagline: "What departments get",
    heading: "The ROI summary",
    description:
      "This isn't just training — it's a program built around your department's staffing, budget, and retention goals.",
    sections: [
      {
        icon: { src: "/images/landing-pages/book_ribbon.svg", alt: "Book ribbon icon" },
        heading: "Accredited & state-approved",
        description: "Training your command staff and board will sign off on.",
      },
      {
        icon: { src: "/images/landing-pages/ink_pen.svg", alt: "Ink pen icon" },
        heading: "Flexible scheduling",
        description: "Built around shift rotations so it doesn't disrupt minimum staffing.",
      },
      {
        icon: { src: "/images/landing-pages/handshake.svg", alt: "Handshake icon" },
        heading: "A real advancement ladder",
        description: "Gives your people a reason to stay instead of leaving for one.",
      },
      {
        icon: { src: "/images/landing-pages/arrow_forward.svg", alt: "Arrow forward icon" },
        heading: "Group enrollment & funding guidance",
        description: "Support from start to finish, not just a sign-up form.",
      },
      {
        icon: { src: "/images/landing-pages/book_ribbon.svg", alt: "Book ribbon icon" },
        heading: "Ongoing recertification",
        description: "Continuing education for your whole crew, not just one-time training.",
      },
    ],
  },
  content12: {
    body: "This isn't a one-time class booking. Departments that train with Midwest EMS Academy typically come back for recertifications, ACLS/PALS renewals, and the next tier of training as their people advance. We track your department's certification status across your whole crew, flag upcoming renewals before they lapse, and can stand up a new cohort whenever you're ready to move the next group up the ladder.",
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
          "Our entire fire department uses Midwest EMS Academy for continuing education. The online courses make recertification simple, and we trust the quality. Midwest EMS Academy keeps our team sharp.",
        avatar: { src: "/images/instructors/Hajmohammad.jpg", alt: "Mark D." },
        name: "Mark D.",
        position: "Fire Chief",
        companyName: "Department Partner",
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
          "As a working mom, I appreciated Midwest EMS Academy's flexible schedule. I studied online after work and joined hands-on sessions on weekends. I never felt overwhelmed, and now I'm a certified paramedic.",
        avatar: { src: "/images/instructors/Crawford.jpg", alt: "Sarah L." },
        name: "Sarah L.",
        position: "Paramedic",
        companyName: "Program Graduate",
      },
    ],
  },
  cta25: {
    heading: "Ready to talk staffing, schedules, and funding?",
    description: "Talk to our admissions team about group enrollment for your department.",
    buttons: [{ title: "Talk to Admissions About Group Enrollment" }],
  },
  faqBanner: {
    heading: "Questions from station chiefs and training officers",
    description: "Objection handling for decision-makers.",
    questions: [
      {
        title: "Can Midwest EMS Academy train my entire department or group?",
        answer:
          "Yes. We offer group enrollment solutions for departments of any size — whether you have 5 or 500 members — with dedicated coordination and department-wide progress tracking.",
      },
      {
        title: "How do online courses work for hands-on skills like CPR?",
        answer:
          "Coursework and knowledge material are completed online; hands-on skills are always demonstrated and evaluated in person during scheduled skills days.",
      },
      {
        title: "Are the online courses accredited (e.g., CAPCE or state approval)?",
        answer: "Yes — programs are state-approved, and our paramedic program is CAAHEP-accredited.",
      },
      {
        title: "What if some of my staff aren't tech-savvy? Will they struggle with the online system?",
        answer:
          "The platform is built to be straightforward, and our team provides direct support to any student who needs help navigating it — this hasn't been a barrier for departments we've worked with.",
      },
      {
        title: "Is there an option for in-person training?",
        answer:
          "Yes. All programs include in-person skills days, and we can discuss on-site or agency-hosted options for larger group enrollments.",
      },
      {
        title: "How does funding/tuition assistance actually work for a department?",
        answer:
          "It depends on your state and situation — options include SAFER and AFG at the federal level, WIOA funding, and in Kansas, the KBEMS Education Incentive Grant, which your service applies for directly on staff's behalf. Our admissions team will walk you through what applies to your department.",
      },
    ],
    button: { title: "Talk to Admissions" },
  },
  header108: {
    title: "Keep your crew at their best.",
    description:
      "Just like Chief Cindy, you can ensure your team is always prepared, certified, and up-to-date with minimal disruption. Whether your department needs certification, recertification, or continuing education, Midwest EMS Academy keeps your responders — and your community — ready.",
    button: { title: "Register Today" },
  },
};
