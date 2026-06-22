export const emergencyUseOfMedicalOxygenSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Emergency Use of Medical Oxygen",
      description:
        "Learn how to recognize hypoxia and provide emergency oxygen with confidence. This course covers real-world scenarios such as drowning, carbon monoxide poisoning, altitude-related issues, and critical illnesses. Ideal for both medical providers and workplace personnel who may need to act quickly in oxygen emergencies.",
      images: [
        {
          src: "/images/oxygen_1.avif",
          alt: "Emergency Use of Medical Oxygen training",
        },
      ],
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
        credentials: ["Certification provided by American Safety and Health Institute"],
        sections: [
          {
            title: "What's included",
            items: [
              "Instructor-led training",
              "Hands-on oxygen equipment setup",
              "Pulse oximetry practice",
              "Patient assessment guidance",
              "Course completion certificate",
            ],
          },
          {
            title: "What is covered",
            items: [
              "When oxygen is needed",
              "Signs of mild to severe hypoxia",
              "Pulse oximetry and monitoring",
              "Safe oxygen delivery setup",
              "Helping responsive and unresponsive patients",
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
          image: { src: "/images/hypoxia.avif", alt: "Identify hypoxia" },
          tagline: "Recognition",
          heading: "Identify hypoxia",
          description:
            "Learn how to distinguish mild, moderate, and severe hypoxia using symptoms and simple assessment cues. You'll understand when oxygen becomes necessary and how to respond early.",
          tags: ["Assessment", "Recognition", "Early action"],
        },
        {
          image: { src: "/images/oxygen.webp", alt: "Equip yourself" },
          tagline: "Equipment",
          heading: "Equip yourself",
          description:
            "Practice assembling and operating oxygen delivery systems, including regulators, cylinders, and masks. Learn safe handling techniques and how to monitor SpO₂ during use.",
          tags: ["Equipment use", "Monitoring"],
        },
        {
          image: { src: "/images/oxygen2.webp", alt: "Provide support" },
          tagline: "Patient care",
          heading: "Provide support",
          description:
            "Work through how to assist responsive and unresponsive patients while delivering oxygen. Learn how oxygen fits into care for choking, drowning, cardiac arrest, and other emergencies.",
          tags: ["Patient care", "Oxygen delivery"],
        },
      ],
      images: [],
    },
  },
  {
    type: "component" as const,
    component: "Layout 423" as const,
    props: {
      tagline: "Respond to oxygen emergencies",
      heading: "Support every breath",
      description:
        "This course supports medical and non-medical personnel who may need to deliver oxygen during an emergency or assess patients showing signs of hypoxia.",
      features: [
        {
          tagline: "First Aid & BLS providers",
          url: "#",
          heading: "Stronger emergency response",
          description:
            "CPR, AED, and BLS providers deepen their ability to respond to cardiac arrest, drowning, and other oxygen-related medical events with confidence.",
          image: { src: "/images/ems.avif", alt: "First Aid and BLS providers" },
        },
        {
          tagline: "Healthcare professionals",
          url: "#",
          heading: "Prepared for clinical situations",
          description:
            "Nurses, technicians, paramedics, and respiratory therapists strengthen their ability to assess oxygen needs and assist during acute respiratory emergencies.",
          image: { src: "/images/doctors.avif", alt: "Healthcare professionals" },
        },
        {
          tagline: "Workplace safety roles",
          url: "#",
          heading: "Confidence in critical moments",
          description:
            "Lifeguards, industrial workers, airline personnel, and other safety-related roles learn how to recognize oxygen deficiency and respond until EMS arrives.",
          image: { src: "/images/workplace.avif", alt: "Workplace safety roles" },
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
        "Learning emergency oxygen use may sound technical, but our online lessons break it into simple, clear steps. You'll see how oxygen delivery works, when it's needed, and how to use the equipment safely—without any in-person practice required.",
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
          image: { src: "/images/online.avif", alt: "Take the test" },
        },
        {
          heading: "Get certified",
          description:
            "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards.",
          image: { src: "/images/oxygen.avif", alt: "Get certified" },
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
        "This course broke down oxygen use in a way that actually made sense. The real-world examples helped me understand what to do in critical situations.",
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
          title: "Do I need prior medical experience?",
          answer: "No. This course is appropriate for both medical and non-medical participants.",
        },
        {
          title: "Does this course follow AHA and ILCOR guidelines?",
          answer:
            "Yes. It reflects the 2020 AHA Guidelines Update for CPR/ECC and international resuscitation recommendations.",
        },
        {
          title: "Is this course online?",
          answer:
            "Yes. The Emergency Use of Medical Oxygen course is delivered online, with the option to request an in-person skills session for groups or organizations. Remote Skills Verification may also be available depending on course requirements.",
        },
        {
          title: "How long is the class?",
          answer:
            "About 1¾ hours for First Aid/CPR AED providers and 2½ hours for BLS providers.",
        },
        {
          title: "Who typically takes this course?",
          answer:
            "First responders, healthcare workers, lifeguards, airline personnel, industrial workers, and anyone required to complete oxygen safety training.",
        },
        {
          title: "How long is the certification valid?",
          answer: "Two years.",
        },
      ],
    },
  },
];
