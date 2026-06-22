export const activeShooterTrainingSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "ACTIVE VIOLENCE EMERGENCY RESPONSE TRAINING",
      description:
        "Learn threat recognition, escape strategies, and lifesaving bleeding control during active violence events. Designed for schools, workplaces, faith organizations, and teams needing practical safety training.",
      images: [{ src: "/images/avert-2.png", alt: "Active Violence Emergency Response Training" }],
      overlayNav: true,
      courseHeader: {
        registerUrl: "#",
        registerPrice: "0",
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
              "Instructor-led active violence response training",
              "Hands-on bleeding control practice",
              "Realistic scenario drills",
              "Online learning modules (for blended format)",
              "Two-year certification",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Recognizing warning signs",
              "Escape, evade, or attack decisions",
              "Bleeding control & tourniquet use",
              "Working with law enforcement",
              "Responding under stress",
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
          image: { src: "/images/avert-threat.png", alt: "Threat response" },
          tagline: "Recognize early danger",
          heading: "Threat response",
          description:
            "Learn how to identify early indicators of violence and respond decisively. Training focuses on situational awareness and immediate action steps.",
          tags: ["Awareness", "Early signs", "Quick decisions"],
        },
        {
          image: { src: "/images/escape-defend.avif", alt: "Escape or defend" },
          tagline: "Survival actions",
          heading: "Escape or defend",
          description:
            "Build confidence choosing whether to escape, evade, or defend based on conditions. Practice real-world decision-making under stress.",
          tags: ["Escape options", "Movement", "Personal safety"],
        },
        {
          image: { src: "/images/atcc2.avif", alt: "Stop severe bleeding" },
          tagline: "Bleeding control",
          heading: "Stop severe bleeding",
          description:
            "Learn to pack wounds, apply direct pressure, and use tourniquets effectively. These skills help stabilize victims before EMS arrives.",
          tags: ["Tourniquets", "Wound care", "Lifesaving skills"],
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
      heading: "be prepared for real-world emergencies",
      description:
        "AVERT prepares teams across many industries to respond calmly and effectively during active violence.",
      features: [
        {
          tagline: "Schools & education",
          url: "#",
          heading: "Protect staff and students",
          description:
            "Teachers, administrators, and campus staff gain the skills to recognize threats early and protect the people in their care.",
          image: { src: "/images/teachers.avif", alt: "Schools and education" },
        },
        {
          tagline: "Workplaces",
          url: "#",
          heading: "Prepare your whole team",
          description:
            "Offices, retail environments, and corporate teams learn how to respond as a coordinated group during active violence.",
          image: { src: "/images/workplace.avif", alt: "Workplaces" },
        },
        {
          tagline: "Faith & community",
          url: "#",
          heading: "Strengthen community readiness",
          description:
            "Churches, community centers, and public facilities learn practical strategies to keep volunteers and visitors safer during emergencies.",
          image: { src: "/images/faith.avif", alt: "Faith and community" },
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
        "Learning how to respond in an active violence situation can feel intense, but our online training keeps everything clear and manageable. You'll learn how to recognize threats, make fast safety decisions, and apply bleeding-control steps through guided scenarios that are easy to follow and built to help you stay calm under pressure.",
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
        "The scenarios were straightforward and easy to follow. I feel much more confident knowing I can recognize danger sooner and make safer decisions under pressure.",
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
          title: "Who should take AVERT?",
          answer:
            "Anyone who may face active violence at work, school, or in public spaces—teachers, business teams, security staff, volunteers, and community leaders.",
        },
        {
          title: "Does AVERT teach bleeding control?",
          answer:
            "Yes. AVERT includes Stop the Bleed–aligned training such as tourniquets, wound packing, and direct pressure.",
        },
        {
          title: "Is there an online-only version?",
          answer:
            "No. All students must complete an instructor-led skills session, but part of the training can be done online in the blended format.",
        },
        {
          title: "Do I need prior medical training?",
          answer: "No. AVERT is designed for the general public and workplace teams.",
        },
        {
          title: "How long is the class?",
          answer:
            "The in-person session is about 2.5 - 5 hours. Blended delivery includes online self-paced learning followed by an instructor-led session.",
        },
        {
          title: "Is the certification recognized nationally?",
          answer:
            "Yes. AVERT is accepted by many employers, organizations, and institutions as part of emergency preparedness training.",
        },
        {
          title: "Can you train large groups?",
          answer:
            "Yes. MidwestEA can support on-site training for schools, businesses, or community organizations.",
        },
      ],
    },
  },
];
