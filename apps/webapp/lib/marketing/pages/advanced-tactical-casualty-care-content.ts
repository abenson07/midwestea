import type { PageSection } from "@/lib/marketing/site-config";
import { programTeamSection } from "@/lib/marketing/program-team-section";

const registerHref = "#";

export const advancedTacticalCasualtyCareSections: PageSection[] = [
  {
    type: "custom",
    label: "Hero",
    props: {
      titleLines: ["Advanced Tactical Casualty Care"],
      description:
        "Train to manage life-threatening injuries in high-threat environments. This course prepares officers and responders to provide medical care after neutralizing a threat and transitioning from danger to patient care.",
      classStartLabel: "Coming soon",
      classStartDate: "",
      priceNote:
        "This intensive ATCC program combines classroom learning and scenario-based training to teach life-saving care in tactical settings — with multiple delivery options available. $0",
      variant: "waitlist",
      waitlistLabel: "Coming soon",
      registerHref,
      scrollHeight: "300vh",
      video: {
        poster: "/videos/actt_poster.0000000.jpg",
        mp4: "/videos/actt_mp4.mp4",
        webm: "/videos/actt_webm.webm",
      },
    },
  },
  {
    type: "custom",
    label: "Enrollment Bar",
    props: {
      titleLines: ["Advanced Tactical", "Casualty Care"],
      variant: "waitlist",
      waitlistLabel: "Coming soon",
      registerHref,
    },
  },
  {
    type: "component",
    component: "Layout 520",
    props: {
      heading: "Stop the threat. Then save the life.",
      description:
        "ATCC gives officers and responders the skills to treat critical injuries after controlling a scene. You'll learn how to stabilize severe trauma, manage bleeding, support airway and breathing issues, and move patients safely from danger to definitive care — all under real-world stress.",
      cards: [
        { src: "/images/atcc1.avif", alt: "Advanced tactical casualty care training" },
        { src: "/images/move.png", alt: "Casualty movement and evacuation" },
        { src: "/images/buddy-care5.png", alt: "Buddy care in tactical settings" },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 349",
    props: {
      contents: [
        {
          heading: "Tactical trauma care",
          description:
            "Learn to treat life-threatening bleeding, chest injuries, and traumatic wounds during high-threat incidents. Training focuses on rapid assessment, hemorrhage control, and stabilizing injuries in unpredictable environments.",
          tags: ["Bleeding control", "Chest injuries", "Trauma assessment"],
          image: { src: "/images/trauma-care.avif", alt: "Tactical trauma care" },
        },
        {
          heading: "Airway and breathing support",
          description:
            "Practice airway positioning, nasopharyngeal adjuncts, tension pneumothorax recognition, and needle decompression. Skills are taught through hands-on scenarios that mirror real tactical field care.",
          tags: ["Airway management", "NPA use", "Needle decompression"],
          image: { src: "/images/airway.avif", alt: "Airway and breathing support" },
        },
        {
          heading: "Movement and evacuation",
          description:
            "Develop the ability to move injured individuals from warm zones to cold zones safely. Learn litter carries, casualty drags, and extraction techniques under time pressure and team-based conditions.",
          tags: ["Casualty movement", "Evacuation skills", "Litter operations"],
          image: { src: "/images/move.png", alt: "Movement and evacuation" },
        },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 54",
    props: {
      heading: "Who it's for",
      description:
        "The ATCC course is designed for law enforcement officers, tactical teams, and responders who need the skills to provide lifesaving medical care during and after high-risk incidents.",
      subHeadings: [
        {
          title: "Law enforcement",
          description:
            "For patrol officers, field units, and supervisors who may encounter violence, traumatic injuries, or rapidly evolving scenes where immediate medical care is necessary.",
        },
        {
          title: "Tactical units",
          description:
            "Ideal for SWAT, SRT, and specialized teams operating in high-threat environments where medical support must occur before EMS can safely enter.",
        },
        {
          title: "Corrections teams",
          description:
            "A strong fit for corrections officers who respond to inmate altercations, medical emergencies, or high-tension situations where quick intervention is essential.",
        },
        {
          title: "Security personnel",
          description:
            "For private security teams, school security officers, and corporate or venue-based responders responsible for managing injuries during violent or high-risk events.",
        },
        {
          title: "Emergency response teams",
          description:
            "Well suited for workplace ERT members, public safety partners, or community teams who support medical response in unpredictable or crowded environments.",
        },
        {
          title: "Military and veterans",
          description:
            "Appropriate for active-duty service members, reservists, and veterans with experience in tactical or field environments who want to sharpen or expand their casualty care skills.",
        },
      ],
    },
  },
  programTeamSection,
  {
    type: "component",
    component: "Layout 493",
    props: {
      tagline: "Getting certified has never been easier",
      heading: "Get started today",
      description:
        "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You'll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you're starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.",
      tabs: [
        {
          heading: "Apply & Get Prepared",
          description:
            "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence.",
          image: { src: "/images/online.avif", alt: "Apply and get prepared" },
        },
        {
          heading: "Learn From Expert Instructors",
          description:
            "Each program blends online learning with hands-on instruction. You'll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away.",
          image: { src: "/images/clsas.avif", alt: "Learn from expert instructors" },
        },
        {
          heading: "Build Skills Through Training & Evaluations",
          description:
            "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track.",
          image: { src: "/images/avert-meta.png", alt: "Build skills through training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you'll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you'll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/atcc2.avif", alt: "Complete testing and earn your credentials" },
        },
      ],
    },
  },
  {
    type: "component",
    component: "FAQ 6",
    props: {
      heading: "Questions?",
      description:
        "Visit our FAQ section for more information regarding programs, courses, certifications, and more.",
      button: {
        title: "See all FAQs",
        url: "/faq",
      },
      questions: [
        {
          title: "Do I need medical experience to take ATCC?",
          answer:
            "No. The course is designed for officers and tactical responders of all experience levels.",
        },
        {
          title: "Is this the same as TCCC?",
          answer:
            "It follows similar principles but is tailored for law enforcement and civilian tactical operations.",
        },
        {
          title: "What gear will I use?",
          answer:
            "You'll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment.",
        },
        {
          title: "Is this course physically demanding?",
          answer:
            "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely.",
        },
        {
          title: "Can departments book group training?",
          answer: "Yes. Agencies can request private or department-wide sessions.",
        },
      ],
    },
  },
];
