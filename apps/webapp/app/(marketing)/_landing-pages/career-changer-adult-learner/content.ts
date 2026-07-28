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
    title: "Start a New EMS Career Without Quitting Your Day Job",
    description:
      "It's never too late to follow your passion. Midwest EMS Academy offers flexible EMT and Paramedic training programs built for working adults. Keep your job, keep your family commitments, and still get the training you need to launch a rewarding career in emergency services.",
    button: { title: "Get started" },
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
    heading: "Flexible schedule options",
    description:
      "Life is busy, we get it. That's why we offer evening/weekend classes and hybrid online learning. Train for a new career without upending your current routine or responsibilities.",
    checklist: ["Flexible scheduling", "Online learning", "Personalized support"],
    button: { title: "Explore online courses" },
    image: { src: "/images/student-studying.png", alt: "Adult learner studying in the evening" },
    imagePosition: "left",
    imageAspect: "aspect-square",
  },
  layout48: {
    heading: "Hybrid learning model supports your busy life",
    description:
      "Enjoy the convenience of online learning combined with periodic in-person skill sessions. You might do your weekly lectures online from home, then attend a hands-on training lab on a Saturday. It's the best of both worlds for a busy adult learner.",
    subHeadings: [
      {
        title: "Weekend classes",
        description: "Our weekend classes let you complete your certification without missing a day of work.",
      },
      {
        title: "Remote learning",
        description: "Our online portal gives you access to course materials and virtual classrooms anytime, anywhere.",
      },
    ],
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
  layout1B: {
    heading: "No experience required",
    description:
      "Many of our career-changing students come from fields like IT, teaching, military, retail – you name it. You don't need a medical background to start. We begin with the basics and build you up step by step. All you need is commitment and a high school diploma/GED.",
    image: { src: "/images/emt.avif", alt: "Career changer training as an EMT" },
    imagePosition: "right",
  },
  comparison6: {
    tagline: "See how we compare",
    heading: "Affordable hands-on training",
    description: "Ensuring you get the best value for your money.",
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
  content12: {
    heading: "James' story",
    intro:
      "Imagine this: you're 35, working full-time, maybe with kids at home. You've spent a decade or more in another field, but you've always felt the call to emergency medicine – to do something more meaningful. Yet, the thought of dropping everything to go back to school is scary. That's exactly the situation many of our students have faced, and Midwest EMS Academy was built to help people like you.",
    gettingStartedHeading: "Getting started",
    gettingStartedParagraph:
      "James spent 15 years in IT. By his mid-30s, he was successful but unfulfilled. He craved a career where he could help others directly. Still, James had a mortgage, a family, and a 9-to-5 job he couldn't just leave. He chose Midwest EMS Academy's flexible Paramedic program to make his transition possible. During the week, after dinner, James would settle in and watch online lectures or complete interactive assignments at his own pace. Every other Saturday, he attended an in-person lab to practice skills like starting IVs and managing airways with instructors.",
    image: { src: "/images/group-care.avif", alt: "Students attending a hands-on training session" },
    imageCaption:
      "Midwest EMS Academy students attending a hands-on training session as part of a flexible hybrid program.",
    journeyHeading: "His journey",
    journeyParagraph:
      "Was it easy? Not always. James had long days – work in the morning, classwork at night – and some weekends where he was mastering patient assessment instead of relaxing. But with the support of his family and Midwest EMS Academy's staff, he made steady progress. 18 months later, James graduated as a certified Paramedic. He kept his day job until the very week he landed a paramedic position with a local ambulance service. Now he's 37 and starting a job he loves, without having sacrificed his financial security to get here.",
    quote: "Midwest EMS Academy gave me a second chance at my dream. If I can do it, anyone can.",
    quoteAvatar: { src: "/images/instructors/Jonathan.jpg", alt: "James Doe" },
    quoteAuthor: "James Doe, Paramedic",
    takeawayHeading: "The takeaway",
    takeawayParagraphs: [
      "Maybe your story will be different – perhaps you'll train to be an EMT first (a shorter program) and get a foot in the door that way. Or maybe you're switching from the military or firefighting into EMS and already have some related skills. Whatever your background, if you're passionate about saving lives, we're here to help you do it. We've had students from age 18 to 60 in our classes. Your life experience is an asset in this field.",
      "The bottom line: It's never too late to pursue a career you truly care about. Midwest EMS Academy will work with you to make it happen. Keep your paycheck, keep your commitments, and train for a life-changing new role on your terms. We'll make sure the journey fits your life – and leads you to success.",
    ],
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
    heading: "Ready to take the leap?",
    description:
      "You don't have to choose between your current life and your dream career. Midwest EMS Academy provides a bridge from where you are to where you want to be. If you're ready for a change, we're ready to help you every step of the way. Your new EMS career can start today.",
    button: { title: "Enroll today" },
  },
  faqBanner: {
    heading: "Questions?",
    description:
      "Visit our FAQ section for more information regarding programs, courses, certifications, and more.",
    questions: [
      {
        title: "Am I \"too old\" to start an EMS career?",
        answer:
          "Not at all! We have successful graduates in their 30s, 40s, and beyond. As long as you meet the basic requirements (18 years or older, high school diploma/GED, and a desire to help others), you can become an EMT or Paramedic at any adult age. In fact, students who join later often bring incredible maturity, empathy, and real-world experience. EMS teams value diversity and life experience – it helps in relating to patients. So no, it's not too late for you to start this journey. We welcome and support adult learners.",
      },
      {
        title: "I haven't been a student in years. How will I keep up with studying and tests?",
        answer:
          "Our instructors know most students are returning to the classroom after years away. Coursework is broken into manageable modules, and advisors and tutors are available throughout the program to help you build good study habits and stay on track.",
      },
      {
        title: "Can I really work full-time and do this?",
        answer:
          "Yes — the program is built specifically for working adults. Evening, weekend, and hybrid online formats let you keep your job and complete your training around your existing schedule.",
      },
      {
        title: "How much time per week will I need to dedicate to training?",
        answer:
          "It varies by track, but most working students dedicate 8–12 hours a week between online coursework and in-person labs. An advisor can map out a realistic weekly schedule for your specific program.",
      },
      {
        title: "What if I have family obligations (kids, etc.)?",
        answer:
          "Many of our students are parents. Evening and weekend class options are designed so you can keep up with family commitments while you train — you don't have to choose one over the other.",
      },
    ],
    button: { title: "Visit FAQ page" },
  },
  header108C: {
    title: "Your next career starts here.",
    description: "Join the working adults who've already made the change into EMS.",
    button: { title: "Request program info" },
  },
};
