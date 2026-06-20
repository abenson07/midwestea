export const pediatricAdvancedLifeSupportSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Pediatric Advanced Life Support",
      description:
        "Build the skills to recognize, assess, and treat critically ill or injured children. PALS prepares you for complex pediatric emergencies through scenario-based learning, airway and rhythm practice, and AHA-aligned guidance. Designed for healthcare and EMS providers who care for infants and children.",
      images: [
        {
          src: "/images/pals-meta.png",
          alt: "Pediatric Advanced Life Support training",
        },
      ],
      overlayNav: true,
      courseHeader: {
        registerUrl: "https://buy.stripe.com/14A4gzffF399fo10I26Vq0D",
        registerPrice: "34.99",
        classDetails: [
          { label: "Online class" },
          { label: "Certifies for 2 years" },
          { label: "About 15 hours" },
          { label: "95% graduation rate" },
        ],
        testimonial: {
          quote:
            "The hands-on scenarios made a huge difference — I left feeling confident I could actually respond in a real emergency. The instructors were knowledgeable, supportive, and kept the training engaging from start to finish.",
          attribution: "John Smith, Fire chief",
        },
        credentials: [
          "Certification provided by American Health Association",
          "Meets requirements of the Joint Commission and the Commission on Accreditation of Medical Transport Services",
          "Nationally approved by the Continuing Education Board for Emergency Services, National Registry of Emergency Medical Technicians and many prominent medical and healthcare organizations",
        ],
        sections: [
          {
            title: "What's included",
            items: [
              "Instructor-led pediatric scenario practice",
              "Airway, ventilation, and rhythm skill stations",
              "Online learning access (for blended formats)",
              "Performance and written evaluations",
              "Two-year certification card",
            ],
          },
          {
            title: "What is covered",
            items: [
              "Pediatric arrest management",
              "Respiratory & shock case recognition",
              "Airway skills and bag-mask ventilation",
              "Rhythm interpretation & pediatric pharmacology",
              "Team-based pediatric resuscitation",
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
          image: { src: "/images/pals.avif", alt: "Assess sick children" },
          tagline: "Pediatric assessment",
          heading: "Assess sick children",
          description:
            "Learn how to rapidly identify respiratory distress, shock, and early signs of deterioration using structured pediatric assessment tools. Understand what changes require immediate intervention.",
          tags: ["Pediatric assessment", "Early recognition", "Critical decisions"],
        },
        {
          image: { src: "/images/pals-airway.avif", alt: "Manage airway needs" },
          tagline: "Airway & breathing",
          heading: "Manage airway needs",
          description:
            "Strengthen your ability to secure and support the pediatric airway with age-specific techniques. Practice bag-mask ventilation, adjunct use, and respiratory management in realistic scenarios.",
          tags: ["Airway care", "Ventilation", "Pediatric techniques"],
        },
        {
          image: { src: "/images/kid-rythms.avif", alt: "Treat rhythms fast" },
          tagline: "Cardiac emergencies",
          heading: "Treat rhythms fast",
          description:
            "Build rhythm interpretation and pharmacology skills for infants and children. Learn to manage arrest, bradycardia, tachyarrhythmias, and peri-arrest conditions under pressure.",
          tags: ["Rhythm skills", "Pharmacology", "Resuscitation"],
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
      heading: "Skills for pediatric emergency care",
      description:
        "PALS supports healthcare and EMS providers who care for infants and children in high-acuity situations.",
      features: [
        {
          tagline: "Hospital & acute care",
          url: "#",
          heading: "Essential pediatric readiness",
          description:
            "Nurses, physicians, and clinical staff learn structured approaches to pediatric arrest, respiratory compromise, and shock management.",
          image: { src: "/images/doctors.avif", alt: "Hospital and acute care" },
        },
        {
          tagline: "EMS providers",
          url: "#",
          heading: "Pediatric care in the field",
          description:
            "EMTs and paramedics strengthen the pediatric-specific decision-making needed for out-of-hospital emergencies.",
          image: { src: "/images/ems.avif", alt: "EMS providers" },
        },
        {
          tagline: "Advanced trainees",
          url: "#",
          heading: "clinical rotations",
          description:
            "Many advanced programs require PALS before pediatric, ED, or ICU rotations to ensure safe and confident patient care.",
          image: { src: "/images/advanced-trainee.avif", alt: "Advanced trainees" },
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
        "Pediatric emergencies can be intimidating, but our online lessons break everything down into approachable, easy-to-follow steps. You'll learn what to look for, how to respond, and how to make sound decisions using supportive, guided scenarios designed just for online learning.",
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
        "The pediatric scenarios helped me understand exactly what to look for. The course clarified the steps I need to take in high-stress situations, and I feel more prepared to protect my patients.",
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
          title: "Do I need BLS before taking PALS?",
          answer:
            "Yes. Pediatric BLS competency is required since PALS builds directly on those skills.",
        },
        {
          title: "Is PALS only for hospital staff?",
          answer:
            "No. Paramedics and EMS providers also benefit from PALS, especially when managing pediatric respiratory and cardiac events.",
        },
        {
          title: "How long is the PALS course?",
          answer: "About 15 hours depending on delivery format.",
        },
        {
          title: "Is there a written test?",
          answer: "Yes. PALS includes a written exam plus scenario-based performance evaluations.",
        },
        {
          title: "Can I take PALS fully online?",
          answer:
            "PALS is offered online, but you must complete a required skills evaluation to receive certification. This can be done in person by request or through approved Remote Skills Verification, depending on availability.",
        },
        {
          title: "Does the course require ECG knowledge?",
          answer: "Basic ECG interpretation and pediatric rhythm understanding are required.",
        },
        {
          title: "How long is certification valid?",
          answer: "The PALS certification is valid for two years.",
        },
      ],
    },
  },
];
