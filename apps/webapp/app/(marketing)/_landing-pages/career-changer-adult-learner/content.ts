import type { Header108Props } from "./components/header-108";
import type { Header108CProps } from "./components/header-108-c";
import type { Layout1Props } from "./components/layout-1";
import type { Layout1BProps } from "./components/layout-1-b";
import type { Layout48Props } from "./components/layout-48";
import type { Layout241Props } from "./components/layout-241";
import type { Comparison6Props } from "./components/comparison-6";
import type { Content12Props } from "./components/content-12";
import type { Testimonial19Props } from "./components/testimonial-19";
import type { Cta25Props } from "./components/cta-25";
import type { Faq6Props } from "@/components/marketing/faq-6";

export type CareerChangerAdultLearnerContent = {
  header108A: Header108Props;
  layout1A: Layout1Props;
  layout48: Layout48Props;
  layout241: Layout241Props;
  layout1B: Layout1BProps;
  comparison6: Comparison6Props;
  content12: Content12Props;
  testimonial19: Testimonial19Props;
  cta25: Cta25Props;
  faqBanner: Faq6Props;
  header108C: Header108CProps;
};

export const careerChangerContent: CareerChangerAdultLearnerContent = {
  header108A: {
    title: "Start a new EMS career without quitting your day job.",
    description:
      "It's never too late to start a new path. Midwest EMS Academy offers flexible EMT and Paramedic training built for working adults. Keep your job, keep your family commitments, and still get the training you need to launch a career in emergency services.",
    button: { title: "Get Started" },
    images: [
      { src: "/images/emt-hero.avif", alt: "EMT student training" },
      { src: "/images/emt.avif", alt: "EMT in the field" },
      { src: "/images/emt-compressions.avif", alt: "EMT performing chest compressions" },
      { src: "/images/paramedic-1.avif", alt: "Paramedic on duty" },
      { src: "/images/paramedic.avif", alt: "Paramedic training" },
      { src: "/images/ems.avif", alt: "EMS professionals" },
      { src: "/images/student-studying.png", alt: "Adult learner studying at home" },
    ],
  },
  layout1A: {
    heading: "Fits your current life",
    description:
      "Life is busy, and we get it. That's why we offer evening/weekend classes and hybrid online learning. Train for a new career without upending your current routine or responsibilities.",
    checklist: ["Flexible scheduling", "Online learning", "Personalized support"],
    button: { title: "Explore online courses" },
    image: { src: "/images/student-studying.png", alt: "Adult learner studying in the evening" },
    imagePosition: "left",
    imageAspect: "aspect-square",
  },
  layout48: {
    heading: "Your biggest hesitations, answered",
    description:
      "If any of these sound familiar, you're not alone — here's how we handle the questions career-changers ask us most.",
    subHeadings: [
      {
        title: "“I'm too old to start an EMS career.”",
        description:
          "Not at all — we have successful graduates in their 30s, 40s, and beyond. As long as you meet the basic requirements (18 or older, high school diploma/GED), a desire to help others is what matters. You are not too late to start this journey.",
      },
      {
        title: "“I haven't been a student in years. How will I keep up?”",
        description:
          "Our hybrid format is built for adults, not fresh-out-of-high-school students. One-on-one tutoring, detailed study guides, and a community of peers going through the same thing mean you're never studying alone.",
      },
      {
        title: "“Can I really work full-time and do this?”",
        description:
          "Yes. Coursework is online and self-paced within deadlines; only skills days require you in person, and we offer multiple scheduling options built around work and family life.",
      },
    ],
  },
  layout241: {
    tagline: "How it works",
    heading: "The path, step by step",
    description:
      "Becoming an EMT is a finite, three-step process — not an open-ended commitment. Here's exactly what it looks like.",
    sections: [
      {
        icon: { src: "/images/landing-pages/book_ribbon.svg", alt: "Book ribbon icon" },
        heading: "1. Enroll",
        description:
          "Complete your application, meet the basic requirements, and pick a cohort that fits your schedule.",
      },
      {
        icon: { src: "/images/landing-pages/ink_pen.svg", alt: "Ink pen icon" },
        heading: "2. Train",
        description:
          "Work through online coursework and attend hands-on skills days with real instructors and real scenarios.",
      },
      {
        icon: { src: "/images/landing-pages/handshake.svg", alt: "Handshake icon" },
        heading: "3. Get hired",
        description:
          "Sit for your NREMT exam, get certified, and start applying — many students are hired within weeks of certifying.",
      },
    ],
  },
  layout1B: {
    heading: "No experience required.",
    description:
      "Many of our career-changing students come from fields like IT, teaching, military, retail — you name it. You don't need a medical background to start. We begin with the basics and build you up step by step. All you need is commitment and a high school diploma/GED.",
    button: { title: "See What You Need to Start" },
    image: { src: "/images/emt.avif", alt: "Career changer training as an EMT" },
    imagePosition: "right",
  },
  comparison6: {
    tagline: "See how we compare",
    heading: "Affordable hands-on training",
    description: "Ensuring you get the best value for your money.",
    competitorName: "Local college program",
    baseTuition: { midwestEa: "$2,150", competitor: "$4,610" },
    costRows: [
      { label: "Books", midwestEa: "Included", competitor: "$300" },
      { label: "Supplies", midwestEa: "Included", competitor: "$500" },
      { label: "Certification fee", midwestEa: "N/A", competitor: "$25" },
      { label: "Materials", midwestEa: "Included", competitor: "$125" },
      { label: "Insurance", midwestEa: "N/A", competitor: "$60" },
    ],
    totalCost: { midwestEa: "$2,150", competitor: "$4,610" },
    button: { title: "Register today to lock in your price" },
  },
  content12: {
    heading: "James' story",
    intro:
      "Imagine this: you're 35, working full-time, maybe with kids at home. You've spent over a decade in another field, but you've always felt the call to emergency medicine – to do something more meaningful. Yet the thought of dropping everything to go back to school is scary. That's exactly the situation James was in, and Midwest EMS Academy was built to help people like him.",
    gettingStartedHeading: "Getting started",
    gettingStartedParagraph:
      "James spent over a decade working overnight warehouse shifts. He had a family depending on his paycheck and couldn't just walk away from his job to go back to school full-time. He chose Midwest EMS Academy's hybrid EMT program because it let him keep working while he trained. During the week, after his shift, James worked through online coursework at his own pace. On scheduled skills days, he came in for hands-on practice — CPR, splinting, bleeding control, patient assessment — alongside classmates who were becoming his support system, not just classmates.",
    image: { src: "/images/group-care.avif", alt: "Students attending a hands-on training session" },
    imageCaption:
      "Midwest EMS Academy students attending a hands-on training session as part of a flexible hybrid program.",
    journeyHeading: "His journey",
    journeyParagraph:
      "Was it easy? Not always. James had long days – work overnight, coursework whenever he could fit it in – and weekends spent on skills instead of resting. But with one-on-one tutoring, detailed study guides, and the support of his family, he made steady progress. Twelve weeks after his first class, James was a certified EMT. He was hired by a local ambulance service within weeks of certifying — without ever having to quit his job to get there.",
    quote: "Midwest EMS Academy gave me a second chance at my dream. If I can do it, anyone can.",
    quoteAvatar: { src: "/images/instructors/Jonathan.jpg", alt: "James M." },
    quoteAuthor: "James M., Certified EMT (formerly full-time warehouse worker)",
    takeawayHeading: "The takeaway",
    takeawayParagraphs: [
      "Maybe your story will be different – maybe you're switching from the military, teaching, IT, or retail, and already have some transferable skills. Whatever your background, if you're passionate about helping others, we're here to help you do it. We've had students from age 18 to 60 in our classes. Your life experience is an asset in this field.",
      "The bottom line: it's never too late to pursue a career you truly care about. Midwest EMS Academy will work with you to make it happen. Keep your paycheck, keep your commitments, and train for a life-changing new role on your terms. We'll make sure the journey fits your life – and leads you to success.",
    ],
  },
  testimonial19: {
    heading: "Customer stories",
    description: "Our dedication to exceeding expectations is apparent with each customer interaction.",
    testimonials: [
      {
        numberOfStars: 5,
        quote:
          "Midwest EMS Academy gave me a second chance at my dream. If I can do it, anyone can.",
        avatar: { src: "/images/instructors/Jonathan.jpg", alt: "James M." },
        name: "James M.",
        position: "Certified EMT",
        companyName: "Formerly full-time warehouse worker",
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
    heading: "Ready to take the leap?",
    description:
      "You don't have to choose between your current life and your dream career. Midwest EMS Academy provides a bridge from where you are to where you want to be. We're ready to help you every step of the way. Your new EMS career can start today.",
    button: { title: "Enroll Now" },
  },
  faqBanner: {
    heading: "Questions?",
    description:
      "Remaining practical questions career-changers ask before enrolling.",
    questions: [
      {
        title: "Am I \"too old\" to start an EMS career?",
        answer:
          "Not at all. We have successful graduates in their 30s, 40s, and beyond. As long as you meet the basic requirements (18 or older, high school diploma/GED), a desire to help others is what matters. So it's not too late to start your journey.",
      },
      {
        title: "I haven't been a student in years. How will I keep up with studying and tests?",
        answer:
          "Our tutoring, study guides, and peer community exist specifically for this. You won't be figuring it out alone.",
      },
      {
        title: "Can I really work full-time and do this?",
        answer: "Yes — that's the whole design of the hybrid format.",
      },
      {
        title: "How much time per week will I need to dedicate to training?",
        answer:
          "Plan for a mix of self-paced online coursework each week plus scheduled in-person skills days — exact hours vary by program (EMT totals roughly 12 weeks of combined coursework and skills days).",
      },
      {
        title: "What if I have family obligations (kids, etc.)?",
        answer:
          "Multiple schedule options, evening/weekend availability, and a support team that understands you're balancing more than just school are built into how we run these programs.",
      },
    ],
    button: { title: "Visit FAQ page" },
  },
  header108C: {
    title: "It's never too late to start your next chapter.",
    description:
      "Midwest EMS Academy offers flexible EMT and Paramedic training built for working adults just like you. Keep your job, keep your family commitments, and still get the training you need to launch a career in emergency services.",
    button: { title: "Start Your EMS Career Today" },
  },
};
