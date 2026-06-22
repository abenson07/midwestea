export const useAndAdministrationOfEpinephrineAutoInjectorsSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Use and Administration of Epinephrine Auto-Injectors",
      description:
        "Learn the essentials of recognizing anaphylaxis and responding quickly with an epinephrine auto-injector. This course teaches safe administration techniques, legal considerations, and what to do before, during, and after an allergic emergency. Ideal for school staff, childcare providers, first responders, and anyone who may need to act in a high-stakes moment.",
      images: [
        {
          src: "/images/epi.webp",
          alt: "Use and Administration of Epinephrine Auto-Injectors training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "#",
        registerPrice: "0",
        classDetails: [
          { label: "Online only" },
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
        ],
        sections: [
          {
            title: "What's included",
            items: [
              "Instructor-led training",
              "Hands-on auto-injector practice",
              "Emergency response guidance",
              "Legal and regulatory overview",
              "Course completion certificate",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Recognizing signs of anaphylaxis",
              "Proper auto-injector use",
              "Safety and legal considerations",
              "When to activate EMS",
              "Aftercare and ongoing monitoring",
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
          image: { src: "/images/signs.avif", alt: "Know the signs" },
          tagline: "Emergency recognition",
          heading: "Know the signs",
          description:
            "Learn how to quickly identify the symptoms of anaphylaxis and distinguish them from mild allergic reactions. Early recognition helps you act confidently and without hesitation.",
          tags: ["Symptom awareness", "Rapid response", "Safety"],
        },
        {
          image: { src: "/images/application.avif", alt: "Use it safely" },
          tagline: "Auto-injector skills",
          heading: "Use it safely",
          description:
            "Practice the correct steps for administering an epinephrine auto-injector, including site placement, safety checks, and post-use actions. Training covers commonly used devices and safe handling.",
          tags: ["Technique", "Hands-on skills", "Confidence"],
        },
        {
          image: { src: "/images/paperwork.avif", alt: "Be prepared" },
          tagline: "Legal & preparedness",
          heading: "Be prepared",
          description:
            "Understand state regulations, Good Samaritan protections, and your responsibilities when administering epinephrine. Learn how to stay ready with proper storage, planning, and communication.",
          tags: ["Regulations", "Preparedness", "Best practices"],
        },
      ],
      images: [],
    },
  },
  {
    type: "component" as const,
    component: "Layout 423" as const,
    props: {
      tagline: "the skills you need",
      heading: "responding to severe allergic reactions",
      description:
        "This course supports anyone responsible for safety in schools, childcare, healthcare, and community settings.",
      features: [
        {
          tagline: "School staff",
          url: "#",
          heading: "Confidence during emergencies",
          description:
            "Teachers, coaches, and support staff learn to recognize anaphylaxis quickly and deliver epinephrine safely while waiting for EMS.",
          image: { src: "/images/teachers.avif", alt: "School staff" },
        },
        {
          tagline: "Childcare providers",
          url: "#",
          heading: "Prepared for high-risk situations",
          description:
            "Caregivers gain the skills needed to act fast with infants and children who may have known or unknown allergies.",
          image: { src: "/images/youth-programs.avif", alt: "Childcare providers" },
        },
        {
          tagline: "First responders & public safety",
          url: "#",
          heading: "Ready for immediate action",
          description:
            "Police, security, and EMS-adjacent roles build confidence in rapid epinephrine use and early emergency activation.",
          image: { src: "/images/ems.avif", alt: "First responders and public safety" },
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
        "Responding to a severe allergic reaction can feel high-pressure—but our online training keeps things clear, calm, and straightforward. You'll learn exactly when and how epinephrine should be used through simple demonstrations and guided examples.",
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
          image: { src: "/images/group-care.avif", alt: "Get certified" },
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
        "The course made allergic reactions much less scary. Knowing how and when to use an auto-injector makes me feel prepared at work and at home.",
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
          title: "Do I need healthcare experience to take this course?",
          answer:
            "No. This course is designed for anyone who may need to respond to severe allergic reactions.",
        },
        {
          title: "Does the class teach multiple types of auto-injectors?",
          answer:
            "Yes. You will learn the general principles and commonly used devices so you're prepared for real-world situations.",
        },
        {
          title: "Is there a written test?",
          answer:
            "A written evaluation may be required depending on organizational or state regulations, but many students complete the course with skills evaluation only.",
        },
        {
          title: "How long is the class?",
          answer: "Most sessions take 30–60 minutes depending on the delivery method.",
        },
        {
          title: "Is this certification valid in all states?",
          answer:
            "Because state regulations vary, your instructor will explain local requirements and responsibilities during the class.",
        },
        {
          title: "Is this course offered in blended or online formats?",
          answer:
            "Yes. This course is available online, and you may request an in-person skills session if your group or organization needs one. Remote Skills Verification may be available depending on requirements.",
        },
        {
          title: "How long is the certification valid?",
          answer: "The certificate is valid for two years.",
        },
      ],
    },
  },
];
