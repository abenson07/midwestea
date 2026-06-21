export const pediatricFirstAidCprAedSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Pediatric CPR & First Aid",
      description:
        "Learn how to respond confidently to emergencies involving infants and children. This course teaches age-appropriate CPR, choking care, and first aid skills based on the latest AHA and ILCOR guidelines. Designed for teachers, childcare providers, parents, and caregivers who want to protect the children in their care.",
      images: [
        {
          src: "/images/pediatric_advanced_life_support.avif",
          alt: "Pediatric CPR and First Aid training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "#",
        registerPrice: "34.99",
        classDetails: [
          { label: "Online class" },
          { label: "Certifies for 2 years" },
          { label: "1.5–6 hours" },
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
              "Instructor-led pediatric CPR and first aid training",
              "Scenario-based practice with infant and child manikins",
              "All equipment provided",
              "Choice of pediatric or combined certification",
              "Two-year certification card",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Infant and child CPR",
              "AED use for children",
              "Choking response",
              "Pediatric injury & illness care",
              "Allergy, breathing, and emergency basics",
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
          image: {
            src: "/images/pediatric_advanced_life_support.avif",
            alt: "Infant and child CPR",
          },
          tagline: "Pediatric CPR",
          heading: "Infant & child CPR",
          description:
            "Learn how to provide high-quality CPR tailored to infants and children. Practice compressions, ventilations, and AED use using age-appropriate techniques.",
          tags: ["CPR techniques", "AED usage", "All ages"],
        },
        {
          image: {
            src: "/images/treat-common-injuries.avif",
            alt: "Treat common injuries",
          },
          tagline: "First aid for kids",
          heading: "Treat common injuries",
          description:
            "Build practical first aid skills for bleeding, burns, falls, allergic reactions, fevers, and other childhood emergencies. Learn clear, simple steps you can use right away.",
          tags: ["First aid", "Injury care", "Pediatric safety"],
        },
        {
          image: { src: "/images/childcare.avif", alt: "Real-world readiness" },
          tagline: "Practice real scenarios",
          heading: "Real-world readiness",
          description:
            "Work through realistic childcare and school-based emergencies that build confidence and quick decision-making.",
          tags: ["Scenarios", "Caregiver skills", "Confidence"],
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
      heading: "Care for every child",
      description:
        "Designed for caregivers, educators, and anyone responsible for children's safety.",
      features: [
        {
          tagline: "Childcare providers",
          url: "#",
          heading: "Prepared for every moment",
          description:
            "Learn essential skills to keep infants and children safe in daycares, preschools, and after-school programs.",
          image: { src: "/images/youth-programs.avif", alt: "Childcare providers" },
        },
        {
          tagline: "Teachers & school staff",
          url: "#",
          heading: "Support students with confidence",
          description:
            "Build the readiness needed to respond quickly to classroom and playground emergencies.",
          image: { src: "/images/teachers.avif", alt: "Teachers and school staff" },
        },
        {
          tagline: "Parents & guardians",
          url: "#",
          heading: "Care you can rely on",
          description:
            "Gain peace of mind knowing you can respond calmly and effectively if a child needs help.",
          image: { src: "/images/group-care.avif", alt: "Parents and guardians" },
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
        "Caring for infants and children in emergencies takes confidence, and our online course gives you just that. Each topic is broken into manageable steps with clear examples and guided scenarios designed to help you learn calmly and quickly.",
      tabs: [
        {
          heading: "Register & Get Started",
          description:
            "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step.",
          image: { src: "/images/online2.avif", alt: "Register and get started" },
        },
        {
          heading: "Take the Test",
          description: (
            <>
              When you&apos;re ready, complete the online exam. Most courses require a{" "}
              <strong>75% or higher</strong> to pass, and some may include an in-person or Remote
              Skills Verification session.
            </>
          ),
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
        "This was perfect for someone like me who works with kids every day. The examples were simple, clear, and gave me real confidence.",
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
          title: "Is this course only for childcare workers?",
          answer:
            "No. Parents, teachers, camp staff, and community members often take this course.",
        },
        {
          title: "Is the certification valid for two years?",
          answer: "Yes. Pediatric CPR & First Aid certifications are valid for two years.",
        },
        {
          title: "Is this available in Spanish?",
          answer:
            "Yes. Classes are offered in both English and Spanish depending on location and schedule.",
        },
        {
          title: "How long is the course?",
          answer: "Typically 1.5–6 hours depending on the certification type selected.",
        },
        {
          title: "Is there a written test?",
          answer:
            "Most students complete the course through hands-on demonstration, not a written exam.",
        },
        {
          title: "Can I certify for adults too?",
          answer: "Yes. You can choose combined Adult/Child/Infant certification if needed.",
        },
      ],
    },
  },
];
