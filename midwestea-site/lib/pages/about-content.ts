import type { PageSection } from "@/lib/site-config";

const placeholder = "/images/placeholder-image.svg";
const icon = "/images/icon.svg";
const logo = "/images/Company-Logo.svg";

const heroImages = [
  { src: "/images/emt.avif", alt: "EMT skills training" },
  { src: "/images/cpr.avif", alt: "CPR certification training" },
  { src: "/images/aed.avif", alt: "AED training" },
  { src: "/images/clsas.avif", alt: "Hands-on EMS instruction" },
  { src: "/images/paramedic.avif", alt: "Paramedic training" },
  { src: "/images/firefighter.avif", alt: "Fire and EMS responders" },
  { src: "/images/student.avif", alt: "EMS student learning" },
];

const aboutFaqQuestions = [
  {
    title: "Who is Midwest Emergency Academy for?",
    answer:
      "MidwestEA serves both people entering EMS for the first time and experienced professionals maintaining or advancing their credentials. Our programs support career-track training, while our courses provide targeted certification and continuing education.",
  },
  {
    title: "Who teaches the courses and programs?",
    answer:
      "All MidwestEA instruction is led by experienced EMS professionals with real-world field backgrounds. Our instructors are selected not just for their credentials, but for their ability to teach clearly, responsibly, and in line with current standards.",
  },
  {
    title: "Is MidwestEA an accredited and legitimate training provider?",
    answer:
      "Yes. MidwestEA offers state-approved programs and NREMT-aligned education that meets recognized EMS standards. We take compliance and instructional quality seriously, and we do not offer shortcuts or unapproved training.",
  },
  {
    title: "What makes MidwestEA different from other training providers?",
    answer:
      "MidwestEA was built by people who have worked in the field and understand what training actually needs to prepare you for. We focus on clarity, realism, and high expectations—without intimidation, filler, or unnecessary complexity.",
  },
  {
    title: "Where is MidwestEA based, and who do you serve?",
    answer:
      "MidwestEA serves students across Missouri, Kansas, and the greater Midwest. While our reach continues to grow, our focus remains on providing trusted, accessible EMS education grounded in regional standards and real-world practice. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material.",
  },
];

export const aboutSections: PageSection[] = [
  {
    type: "component",
    component: "Header 108",
    props: {
      title: "Real training. Real instructors.",
      description:
        "Midwest Emergency Academy is built by EMS professionals who believe training should be trusted, approachable, and grounded in real experience. We teach with clarity, purpose, and respect for the responsibility this work carries.",
      buttons: [
        { title: "Explore programs", url: "/programs" },
        { title: "View courses", variant: "secondary", url: "/courses" },
      ],
      images: heroImages,
    },
  },
  {
    type: "component",
    component: "Layout 137",
    props: {
      icon: { src: logo, alt: "Midwest Emergency Academy" },
      heading:
        "Empowering the Midwest's best to respond swiftly, lead with conviction, and rise to every challenge.",
      description:
        "From first-time students to seasoned professionals, we prepare people across Missouri and Kansas to meet real emergencies with confidence. Our mission is simple: deliver EMS education that is credible, practical, and built for the work you'll actually do.",
    },
  },
  {
    type: "component",
    component: "Layout 1",
    props: {
      tagline: "Instruction grounded in the field",
      heading: "We train the people who save lives",
      description:
        "MidwestEA exists to prepare people for real responsibility. We provide legitimate, state-approved EMS education designed for both those just starting out and professionals advancing their careers. Every program is built around clear instruction, high standards, and the realities of emergency medical work.\n\nWe don't cut corners or overcomplicate the process. We focus on teaching what matters—so when you're needed, you're ready.",
      buttons: [
        { title: "See our programs", url: "/programs" },
      ],
      image: { src: "/images/emt-compressions.avif", alt: "EMT performing chest compressions during training" },
    },
  },
  {
    type: "component",
    component: "Layout 228",
    props: {
      sections: [
        {
          image: { src: icon, alt: "Accredited programs" },
          heading: "ACCREDITED PROGRAMS",
          description:
            "Midwest Emergency Academy offers state-approved, NREMT-aligned EMS education that meets national standards. Our programs are built to be legitimate, current, and respected—so your training carries real credibility.",
          buttons: [{ title: "View programs", url: "/programs" }],
        },
        {
          image: { src: icon, alt: "Competitive pricing" },
          heading: "COMPETITIVE PRICING",
          description:
            "We believe quality EMS education should be accessible. Our pricing is transparent and competitive, designed to remove barriers without cutting corners or compromising instruction.",
          buttons: [{ title: "Browse courses", url: "/courses" }],
        },
        {
          image: { src: icon, alt: "Tailored learning" },
          heading: "TAILORED LEARNING",
          description:
            "Our training is built to fit real schedules. With flexible formats, online resources, and instructor support, you can progress without putting work or family on hold.",
          buttons: [{ title: "How it works", url: "/how-it-works/programs" }],
        },
      ],
    },
  },
  {
    type: "component",
    component: "Stats 33",
    props: {
      tagline: "Instruction grounded in the field",
      heading: "Built by people who've done the work.",
      description:
        "Midwest Emergency Academy was founded by experienced EMS professionals who saw the need for training that was practical, clear, and credible. Our founders bring years of field experience, instructional leadership, and a shared commitment to preparing students for real responsibility.",
      stat: {
        image: { src: "/images/buddy-care-3.avif", alt: "EMS professionals training together" },
        statCards: [
          {
            percentage: "150",
            title: "years of combined experience",
            description: "across all of our 32 trainers",
          },
          {
            percentage: "302",
            title: "trained students",
            description: "across the Kansas City region",
          },
          {
            percentage: "429",
            title: "Classes completed",
            description: "since we began in 2016",
          },
        ],
      },
    },
  },
  {
    type: "component",
    component: "Team 2",
    props: {
      tagline: "The best in the midwest",
      heading: "Learn from the pros",
      description:
        "Every MidwestEA instructor is selected for both experience and the ability to teach clearly. They come from EMS, fire, transport, and clinical backgrounds—and they share a common goal: helping students succeed without intimidation or shortcuts.",
      teamMembers: [
        {
          image: { src: placeholder, alt: "Marcus Rivera" },
          name: "Marcus Rivera",
          jobTitle: "Lead EMT Instructor",
          description: "Kansas City Fire & EMS",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "Jessica Park" },
          name: "Jessica Park",
          jobTitle: "Paramedic Program Director",
          description: "Johnson County EMS",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "David Chen" },
          name: "David Chen",
          jobTitle: "ACLS & BLS Instructor",
          description: "Saint Luke's Health System",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "Angela Brooks" },
          name: "Angela Brooks",
          jobTitle: "EMR & Community Training Lead",
          description: "Midwest Emergency Academy",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "Tyler Morrison" },
          name: "Tyler Morrison",
          jobTitle: "Tactical Casualty Care Instructor",
          description: "Overland Park Fire",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "Rachel Nguyen" },
          name: "Rachel Nguyen",
          jobTitle: "Pediatric & PALS Specialist",
          description: "Children's Mercy",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "James Okafor" },
          name: "James Okafor",
          jobTitle: "Critical Care Transport Instructor",
          description: "Life Flight Network",
          socialLinks: [],
        },
        {
          image: { src: placeholder, alt: "Lauren Mitchell" },
          name: "Lauren Mitchell",
          jobTitle: "Continuing Education Coordinator",
          description: "Midwest Emergency Academy",
          socialLinks: [],
        },
      ],
      footer: {
        heading: "Interested in training the next generation of EMS?",
        description:
          "We're always looking for experienced professionals who value clear instruction and high standards.",
        button: {
          title: "Apply to become a trainer",
          variant: "secondary",
          url: "mailto:Sbrooks@midwestea.com",
        },
      },
    },
  },
  {
    type: "component",
    component: "Testimonial 3",
    props: {
      heading: "Learning that carries into the job",
      description:
        "Hear from EMTs, paramedics, and professionals who completed MidwestEA training and now apply it on the job.",
      testimonials: [
        {
          image: { src: logo, alt: "Midwest Emergency Academy" },
          quote:
            '"MidwestEA respects your time and your goal. The instruction was efficient, thorough, and focused on competence — not filler."',
          avatar: { src: "/images/Placeholder-Image.avif", alt: "Ryan" },
          name: "Ryan",
          position: "Firefighter",
          companyName: "Blue Springs",
        },
        {
          image: { src: logo, alt: "Midwest Emergency Academy" },
          quote:
            '"This was the first program where I felt supported without being hand-held. The expectations were high, but the instructors made sure we were prepared to meet them."',
          avatar: { src: "/images/Placeholder-Image.avif", alt: "Samantha K" },
          name: "Samantha K",
          position: "Paramedic",
          companyName: "Olathe",
        },
        {
          image: { src: logo, alt: "Midwest Emergency Academy" },
          quote:
            '"The training felt realistic and relevant. Nothing was overcomplicated, and nothing felt watered down. It was exactly what I needed to feel ready for the job."',
          avatar: { src: "/images/Placeholder-Image.avif", alt: "Miguel" },
          name: "Miguel",
          position: "Caregiver",
          companyName: "Hays",
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
      questions: aboutFaqQuestions,
    },
  },
  {
    type: "component",
    component: "CTA 36",
    props: {
      featureSections: [
        {
          icon: { src: logo, alt: "Midwest Emergency Academy" },
          heading: "Train for a career in EMS",
          description:
            "Comprehensive, state-approved pathways for those preparing for professional roles in emergency medical services.",
          buttons: [{ title: "Discover our programs", url: "/programs" }],
        },
        {
          icon: { src: logo, alt: "Midwest Emergency Academy" },
          heading: "Sharpen your skills",
          description:
            "Focused courses for required certifications, renewals, and skill-specific training.",
          buttons: [{ title: "Explore our courses", url: "/courses" }],
        },
      ],
    },
  },
];
