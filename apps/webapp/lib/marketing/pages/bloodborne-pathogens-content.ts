export const bloodbornePathogensSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Bloodborne Pathogens",
      description:
        "Learn how to recognize exposure risks and protect yourself and others in the workplace. This OSHA-aligned course teaches safe practices, prevention strategies, and what to do if an incident occurs. Designed for anyone who may come into contact with blood or bodily fluids on the job.",
      images: [
        {
          src: "/images/bloodborneupdated.png",
          alt: "Bloodborne Pathogens training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "#",
        registerPrice: "19.99",
        classDetails: [
          { label: "Online class" },
          { label: "Certifies for 1 year" },
          { label: "45–90 minutes" },
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
              "Instructor-led safety training",
              "OSHA-aligned prevention practices",
              "Exposure response guidance",
              "Workplace risk scenarios",
              "Course completion certificate",
            ],
          },
          {
            title: "What is covered",
            items: [
              "How pathogens spread",
              "Exposure risks and prevention",
              "PPE and safe work practices",
              "What to do after an exposure",
              "OSHA rules and responsibilities",
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
          image: { src: "/images/blood-risks.avif", alt: "Know the hazards" },
          tagline: "Risk awareness",
          heading: "Know the hazards",
          description:
            "Learn what bloodborne pathogens are, how exposure happens, and how to identify risks in real workplace environments.",
          tags: ["Awareness", "Prevention", "Safety basics"],
        },
        {
          image: { src: "/images/sharps.webp", alt: "Prevent exposure" },
          tagline: "Safe practices",
          heading: "Prevent exposure",
          description:
            "Build confidence using PPE and safe work habits to reduce the chance of contact with blood or bodily fluids. Learn universal precautions and why consistency matters.",
          tags: ["PPE", "Universal precautions", "Workplace safety"],
        },
        {
          image: { src: "/images/blood-borne.jpg", alt: "Exposure response" },
          tagline: "Act quickly",
          heading: "Exposure response",
          description:
            "Understand what to do after a potential exposure, including immediate steps, reporting requirements, and follow-up protocols.",
          tags: ["Response steps", "Reporting"],
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
      heading: "Protect yourself",
      description:
        "This course supports anyone who may encounter blood or bodily fluids in their workplace or community role.",
      features: [
        {
          tagline: "Workplace teams",
          url: "#",
          heading: "Safety in everyday tasks",
          description:
            "Employees in offices, warehouses, retail, and service environments learn how to protect themselves during unexpected exposure incidents.",
          image: { src: "/images/workplace.avif", alt: "Workplace teams" },
        },
        {
          tagline: "Care and support roles",
          url: "#",
          heading: "Protection for helping professions",
          description:
            "Childcare workers, educators, and community staff learn practical precautions when assisting others who may be injured or ill.",
          image: { src: "/images/caregivers.avif", alt: "Care and support roles" },
        },
        {
          tagline: "Public safety & responders",
          url: "#",
          heading: "Ready for real situations",
          description:
            "Security staff, volunteers, and EMS-adjacent roles learn how to recognize hazards and respond safely if exposure occurs.",
          image: { src: "/images/ems.avif", alt: "Public safety and responders" },
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
        "Understanding exposure risks doesn't have to be complicated. This online course walks you through real-world examples, safe practices, and essential steps to protect yourself and others in any workplace setting.",
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
          image: { src: "/images/icu.avif", alt: "Get certified" },
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
        "Everything was explained in simple terms. I finally understand what to do if there's an exposure and how to protect myself at work.",
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
          title: "Does this course meet OSHA requirements?",
          answer:
            "Yes. This training aligns with OSHA's Bloodborne Pathogens Standard for workplace safety.",
        },
        {
          title: "Is there a written test?",
          answer:
            "Some versions include a short knowledge check, but many rely on participation and discussion.",
        },
        {
          title: "Do I need medical training?",
          answer: "No. This course is designed for all workplace roles, not just healthcare.",
        },
        {
          title: "How long is the class?",
          answer: "Typically 45–90 minutes depending on the group and format.",
        },
        {
          title: "Is this offered in Spanish?",
          answer: "Availability varies by schedule.",
        },
        {
          title: "Does this course include CPR?",
          answer:
            "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid.",
        },
        {
          title: "How long is certification valid?",
          answer: "Certification is valid for one year per OSHA guidelines.",
        },
      ],
    },
  },
];
