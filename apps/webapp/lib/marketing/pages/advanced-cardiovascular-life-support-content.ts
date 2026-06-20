export const advancedCardiovascularLifeSupportSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Advanced Cardiovascular Life Support",
      description:
        "Build advanced skills in cardiac arrest management, rhythm interpretation, and team-based response. Ideal for healthcare providers responsible for advanced resuscitation and critical patient care.",
      images: [
        {
          src: "/images/Screenshot-2026-03-26-at-5.57.46-PM.png",
          alt: "Advanced Cardiovascular Life Support training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "https://buy.stripe.com/eVqfZh2sT255cbPbmG6Vq0k",
        registerPrice: "149.99",
        classDetails: [
          { label: "Online class" },
          { label: "Certifies for 2 years" },
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
              "Instructor-led skills coaching and scenario practice",
              "Online learning materials (for blended format)",
              "Required performance evaluations",
              "State- and NREMT-accepted certification card",
              "Two-year certification validity",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Advanced cardiac arrest management",
              "Airway and ventilation strategies",
              "Rhythm recognition & pharmacology",
              "Team leadership and communication",
              "High-risk, high-stress scenario training",
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
          image: { src: "/images/emt-compressions.avif", alt: "Manage arrest events" },
          tagline: "Cardiac emergencies",
          heading: "Manage arrest events",
          description:
            "Learn to assess, prioritize, and lead care during cardiac arrest using AHA-aligned algorithms. Practice defibrillation, rhythm recognition, and time-critical interventions.",
          tags: ["Cardiac arrest", "Algorithms", "Defibrillation"],
        },
        {
          image: { src: "/images/oxygen_1.avif", alt: "Airway and circulation" },
          tagline: "Advanced interventions",
          heading: "Airway & circulation",
          description:
            "Strengthen your airway and circulation skills with hands-on practice in airway adjuncts, ventilation, IV/IO access, and medication-based management.",
          tags: ["Airway support", "Pharmacology", "IV/IO skills"],
        },
        {
          image: { src: "/images/command-post.avif", alt: "Team leadership" },
          tagline: "Lead The Response",
          heading: "Team leadership",
          description:
            "Build confidence guiding a coordinated resuscitation team. Learn clear communication, role assignment, and how to direct complex clinical scenarios.",
          tags: ["Teamwork", "Communication", "Resuscitation leadership"],
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
      heading: "advanced patient care",
      description:
        "ACLS is essential for healthcare providers responsible for cardiac emergencies and high-acuity patient management.",
      features: [
        {
          tagline: "Hospital & clinical staff",
          url: "#",
          heading: "Critical skills for acute care",
          description:
            "Nurses, physicians, and hospital team members strengthen the advanced resuscitation skills needed for cardiac units, ED, ICU, and peri-arrest care.",
          image: { src: "/images/doctors.avif", alt: "Hospital and clinical staff" },
        },
        {
          tagline: "EMS professionals",
          url: "#",
          heading: "High-level field readiness",
          description:
            "EMTs and paramedics gain the structured approach needed for complex pre-hospital cardiac events and rapid intervention in the field.",
          image: { src: "/images/ems.avif", alt: "EMS professionals" },
        },
        {
          tagline: "Students & trainees",
          url: "#",
          heading: "Required for advanced rotations",
          description:
            "Many medical and advanced EMS programs require ACLS before higher-level clinical assignments or specialty rotations.",
          image: { src: "/images/student.avif", alt: "Students and trainees" },
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
        "Advanced cardiac care can seem complex, but we walk you through every concept in a calm, structured way. You’ll learn how to recognize emergencies, follow clinical algorithms, and practice decision-making through guided online scenarios that build confidence without the pressure.",
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
            "When you're ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session.",
          image: { src: "/images/online.avif", alt: "Take the test" },
        },
        {
          heading: "Get certified",
          description:
            "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards.",
          image: { src: "/images/firefigther-prep.png", alt: "Get certified" },
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
        "I was nervous about ACLS, but the way the course explained each rhythm and scenario made everything click. I walked into my renewal feeling confident for the first time.",
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
          title: "Do I need BLS before taking ACLS?",
          answer:
            "Yes. A valid BLS certification is required since ACLS builds directly on foundational resuscitation skills.",
        },
        {
          title: "Is ACLS accepted for hospital and EMS employment?",
          answer:
            "Yes. MidwestEA provides ACLS through ASHI, accepted nationwide by hospitals, EMS agencies, and NREMT.",
        },
        {
          title: "How long is the ACLS course?",
          answer: "Most classes take about 15 hours depending on delivery format.",
        },
        {
          title: "Is there a written test?",
          answer: "Yes. ACLS includes a written evaluation and multiple performance scenarios.",
        },
        {
          title: "Can I take the course fully online?",
          answer:
            "No. ACLS requires an instructor-verified skills evaluation, which can be completed in person or via Remote Skills Verification.",
        },
        {
          title: "Is ACLS offered in Spanish?",
          answer: "No, the ACLS course is only offered in English at this time.",
        },
        {
          title: "Do I need to read ECGs?",
          answer: "Yes. Basic ECG interpretation is a required prerequisite for ACLS participation.",
        },
      ],
    },
  },
];
