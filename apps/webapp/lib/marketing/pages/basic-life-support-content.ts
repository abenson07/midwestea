export const basicLifeSupportSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Basic Life Support",
      description:
        "Learn CPR, AED use, and how to recognize cardiac and respiratory emergencies. Designed for healthcare workers, EMS personnel, and anyone needing BLS for clinical or workplace requirements.",
      images: [{ src: "/images/bls.avif", alt: "Basic Life Support training" }],
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
              "Instructor-led skills practice and coaching",
              "Access to online learning materials (for blended format)",
              "All equipment provided during skills session",
              "State- and NREMT-accepted certification card",
              "Two-year certification period",
            ],
          },
          {
            title: "What is covered",
            items: [
              "High-quality CPR for adults, children, and infants",
              "AED use and safety",
              "Bag-mask ventilation techniques",
              "Choking response for all ages",
              "Team-based resuscitation fundamentals",
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
          image: { src: "/images/cpr.avif", alt: "High-quality CPR basics" },
          tagline: "CPR & early recognition",
          heading: "High-quality CPR basics",
          description:
            "Learn how to recognize cardiac arrest quickly and perform high-quality CPR for adults, children, and infants. Practice the compression and ventilation techniques that directly impact survival outcomes.",
          tags: ["Adult & pediatric CPR", "Early recognition", "Life-saving skills"],
        },
        {
          image: { src: "/images/aed.avif", alt: "AED and ventilation" },
          tagline: "AED & airway skills",
          heading: "AED and ventilation",
          description:
            "Build confidence using an AED and providing effective rescue breaths using both mask and bag-mask devices. Training covers safe operation, rhythm recognition prompts, and proper airway support.",
          tags: ["AED use", "Airway support", "Bag-mask ventilation"],
        },
        {
          image: { src: "/images/cpr2.avif", alt: "Work as a team" },
          tagline: "Team response",
          heading: "Work as a team",
          description:
            "Learn how to perform BLS as part of a coordinated response. Understand roles, communication, and how to support high-performance resuscitation in real clinical settings.",
          tags: ["Team communication", "Shared roles", "Real-world scenarios"],
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
      heading: "Skills for real care",
      description:
        "BLS certification is required across healthcare, public safety, and medical training programs—and prepares you for real-world patient care.",
      features: [
        {
          tagline: "Healthcare providers",
          url: "#",
          heading: "Essential certification for clinical care",
          description:
            "Nurses, CNAs, medical assistants, and hospital staff rely on BLS skills every day. This course prepares you to meet employer requirements and respond confidently during patient emergencies.",
          image: { src: "/images/doctors.avif", alt: "Healthcare providers" },
        },
        {
          tagline: "EMS & public safety",
          url: "#",
          heading: "Foundation for emergency responders",
          description:
            "EMTs, paramedics, and public safety personnel build core airway and resuscitation skills they'll use on every shift. Training reflects scenarios commonly encountered in the field.",
          image: { src: "/images/ems.avif", alt: "EMS and public safety" },
        },
        {
          tagline: "Students & trainees",
          url: "#",
          heading: "Required for healthcare programs",
          description:
            "Many medical, dental, and allied-health programs require BLS before clinical rotations. This course provides the credential you need to advance in your training.",
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
        "Learning Basic Life Support online can feel overwhelming at first, but our guided lessons make it simple. Clear videos, easy-to-understand explanations, and step-by-step practice scenarios help you build confidence at your own pace.",
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
          image: { src: "/images/courses-meta.png", alt: "Get certified" },
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
        "The online lessons were incredibly clear. I felt prepared before I ever took the test, and now I finally understand CPR the way it's meant to be done.",
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
          title: "Do I need BLS before starting EMT or healthcare training?",
          answer:
            "Yes. Most EMT, nursing, and healthcare programs require BLS before beginning clinical work. This course fulfills those requirements.",
        },
        {
          title: "Is the BLS certification accepted nationwide?",
          answer:
            "Yes. MidwestEA provides BLS through ASHI, recognized by NREMT, Joint Commission, CAMTS, and major healthcare organizations.",
        },
        {
          title: "How long does the BLS class take?",
          answer:
            "Depending on delivery type, the course takes between 2.5–5 hours. Blended learning allows you to complete the online portion at your own pace.",
        },
        {
          title: "Is there a written test?",
          answer:
            "Some delivery formats include a short written assessment, but most students complete the course through skills demonstration.",
        },
        {
          title: "What should I bring to class?",
          answer:
            "Just comfortable clothing and a willingness to learn. All equipment is provided.",
        },
        {
          title: "Can I take the entire class online?",
          answer:
            "You can take the learning portion online, but all students must complete an instructor-verified skills evaluation either in person or through Remote Skills Verification.",
        },
        {
          title: "Is the course available in Spanish?",
          answer:
            "Yes. BLS is offered in both English and Spanish, depending on class availability.",
        },
      ],
    },
  },
];
