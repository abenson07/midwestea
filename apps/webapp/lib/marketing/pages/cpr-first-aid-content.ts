export const cprFirstAidSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "CPR / First Aid",
      description:
        "Learn how to respond confidently to medical emergencies with practical CPR and first aid skills. This course covers adult, child, and infant care and follows the latest AHA and ILCOR guidelines. Designed for workplace responders, caregivers, and anyone who wants to be prepared.",
      images: [
        {
          src: "/images/Screenshot-2026-03-26-at-5.57.35-PM.png",
          alt: "CPR and First Aid training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "#",
        registerPrice: "0",
        classDetails: [
          { label: "Online class" },
          { label: "Certifies for 1 year" },
          { label: "2.5 - 5 hours" },
          { label: "95% graduation rate" },
        ],
        testimonial: {
          quote:
            "The hands-on scenarios made a huge difference — I left feeling confident I could actually respond in a real emergency. The instructors were knowledgeable, supportive, and kept the training engaging from start to finish.",
          attribution: "John Smith, Fire chief",
        },
        credentials: [
          "Certification provided by American Safety and Health Institute",
          "Meets requirements of the Joint Commission and the Commission on Accreditation of Medical Transport Services",
          "Nationally approved by the Continuing Education Board for Emergency Services, National Registry of Emergency Medical Technicians and many prominent medical and healthcare organizations",
        ],
        sections: [
          {
            title: "What's included",
            items: [
              "Instructor-led CPR and first aid skills practice",
              "Scenario-based learning and feedback",
              "All equipment provided",
              "Multiple certification pathways (adult / child / infant)",
              "Two-year certification",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Adult, child, infant CPR",
              "AED use and safety",
              "Choking response",
              "First aid for injuries and illness",
              "Bleeding control basics",
            ],
          },
        ],
      },
    },
  },
  {
    type: "component" as const,
    component: "Gallery 22" as const,
    props: {
      heading: "Master essential skills",
      description: "",
      slides: [
        {
          image: { src: "/images/cpr2.avif", alt: "Learn core CPR" },
          tagline: "CPR skills",
          heading: "Learn core CPR",
          description:
            "Build confidence performing CPR on adults, children, and infants. Practice compressions, ventilations, and AED operation with real-time instructor feedback.",
          tags: ["CPR skills", "AED usage", "All ages"],
        },
        {
          image: { src: "/images/buddy-care-2.avif", alt: "Treat common emergencies" },
          tagline: "First aid readiness",
          heading: "Treat common emergencies",
          description:
            "Learn how to recognize and respond to bleeding, injuries, burns, sudden illness, and other common emergencies using simple, effective techniques.",
          tags: ["First aid", "Injury care", "Quick decisions"],
        },
        {
          image: { src: "/images/aed.avif", alt: "Practice real events" },
          tagline: "Real scenarios",
          heading: "Practice real events",
          description:
            "Apply your skills in guided scenarios that simulate workplace and home emergencies. Build confidence making quick decisions under pressure.",
          tags: ["Scenarios", "Confidence"],
        },
      ],
      images: [],
    },
  },
  {
    type: "component" as const,
    component: "Layout 423" as const,
    props: {
      tagline: "relevant for many fields",
      heading: "Skills for everyday emergencies",
      description:
        "Ideal for workplace responders, caregivers, and anyone who wants to be ready when emergencies happen.",
      features: [
        {
          tagline: "Workplace responders",
          url: "#",
          heading: "Keep your team safe",
          description:
            "Employees trained as first responders learn practical skills to stabilize emergencies until professional help arrives.",
          image: { src: "/images/workplace.avif", alt: "Workplace responders" },
        },
        {
          tagline: "Caregivers & staff",
          url: "#",
          heading: "Prepared to protect others",
          description:
            "Teachers, childcare providers, and community staff learn age-appropriate CPR and first aid for those in their care.",
          image: { src: "/images/caregivers.avif", alt: "Caregivers and staff" },
        },
        {
          tagline: "Community members",
          url: "#",
          heading: "Confidence to act",
          description:
            "Anyone can learn skills to protect family, friends, and neighbors during unexpected emergencies.",
          image: { src: "/images/parents.avif", alt: "Community members" },
        },
      ],
    },
  },
  {
    type: "component" as const,
    component: "Layout 493" as const,
    props: {
      tagline: "Getting certified has never been easier",
      heading: "Get started today",
      description:
        "CPR and first aid skills are easier to learn than most people think. Our online platform teaches you exactly what to do through short lessons, simple demonstrations, and helpful practice examples—so you always know what's happening next.",
      tabs: [
        {
          heading: "Register & Get Started",
          description:
            "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step.",
          image: { src: "/images/online2.avif", alt: "Register and get started" },
        },
        {
          heading: "Take the Test",
          description:
            "When you're ready, complete the online exam. Most courses require a **75% or higher** to pass, and some may include an in-person or Remote Skills Verification session.",
          image: { src: "/images/cpr-meta.png", alt: "Take the test" },
        },
        {
          heading: "Get certified",
          description:
            "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards.",
          image: { src: "/images/workplace.avif", alt: "Get certified" },
        },
      ],
      buttons: [],
    },
  },
  {
    type: "component" as const,
    component: "Testimonial 1" as const,
    props: {
      tagline: "Trusted by Industry Professionals",
      quote:
        "The videos and examples made it easy to follow along. I feel ready to help in an emergency, and the certificate was available right after I passed.",
      name: "",
    },
  },
  {
    type: "component" as const,
    component: "FAQ 6" as const,
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
          title: "Is CPR/First Aid offered in Spanish?",
          answer: "Yes. English and Spanish course options are available.",
        },
        {
          title: "Can I certify only in CPR or only in First Aid?",
          answer: "Yes. Multiple certification types are available depending on your needs.",
        },
        {
          title: "Is this course for healthcare providers?",
          answer:
            "Healthcare workers typically take BLS, but this course is great for workplace and community responders.",
        },
        {
          title: "How long is the class?",
          answer: "Depending on certification type, 1.5–6.5 hours.",
        },
        {
          title: "Is there a written test?",
          answer:
            "Most students demonstrate skills through hands-on evaluation rather than a written exam.",
        },
        {
          title: "Is the certification valid for two years?",
          answer: "Yes. All CPR/First Aid certifications are valid for two years.",
        },
        {
          title: "Do I need prior training?",
          answer: "No. This course is designed for beginners and experienced responders alike.",
        },
      ],
    },
  },
];
