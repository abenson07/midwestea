const onlineCourseTag = "Online course — get certified today";

const courseGalleryFaqQuestions = [
  {
    title: "Do I need any experience before taking these courses?",
    answer:
      "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals.",
  },
  {
    title: "How long will it take to complete my course?",
    answer:
      "Course length varies, but all programs are designed to fit into a busy schedule. You'll study at your own pace, follow straightforward lessons, and complete a final evaluation when you're ready.",
  },
  {
    title: "Will my certification be accepted by employers?",
    answer:
      "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer's specific requirements to be sure.",
  },
  {
    title: "What happens after I finish the course?",
    answer:
      "Once you pass the final test, you'll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later.",
  },
  {
    title: "Can I take more than one course?",
    answer:
      "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material.",
  },
];

const certificationCourses = [
  {
    name: "Child & Babysitting Safety",
    tag: onlineCourseTag,
    price: "$34.99",
    url: "/child-and-babysitting-safety",
    image: {
      src: "/images/safe-supervision.avif",
      alt: "Child and Babysitting Safety",
    },
  },
  {
    name: "Basic Life Support",
    tag: onlineCourseTag,
    price: "$49.99",
    url: "/basic-life-support",
    image: { src: "/images/bls.avif", alt: "Basic Life Support" },
  },
  {
    name: "Active Violence Emergency Response Training",
    tag: onlineCourseTag,
    price: "$39.99",
    url: "/active-shooter-training",
    image: {
      src: "/images/avert.jpg",
      alt: "Active Violence Emergency Response Training",
    },
  },
  {
    name: "Advanced Cardiovascular Life Support (ACLS)",
    tag: onlineCourseTag,
    price: "$149.99",
    url: "/advanced-cardiovascular-life-support",
    image: {
      src: "/images/acls.webp",
      alt: "Advanced Cardiovascular Life Support",
    },
  },
  {
    name: "Pediatric CPR & First Aid",
    tag: onlineCourseTag,
    price: "$34.99",
    url: "/pediatric-first-aid-cpr-aed",
    image: {
      src: "/images/pediatric_advanced_life_support.avif",
      alt: "Pediatric CPR and First Aid",
    },
  },
  {
    name: "Bloodborne Pathogens",
    tag: onlineCourseTag,
    price: "$19.99",
    url: "/bloodborne-pathogens",
    image: {
      src: "/images/blood-borne2.jpg",
      alt: "Bloodborne Pathogens",
    },
  },
  {
    name: "Pediatric Advanced Life Support (PALS)",
    tag: onlineCourseTag,
    price: "$34.99",
    url: "/pediatric-advanced-life-support",
    image: {
      src: "/images/pals2.avif",
      alt: "Pediatric Advanced Life Support",
    },
  },
  {
    name: "Emergency Use of Medical Oxygen",
    tag: onlineCourseTag,
    price: "$19.99",
    url: "/emergency-use-of-medical-oxygen",
    image: {
      src: "/images/oxygen_1.avif",
      alt: "Emergency Use of Medical Oxygen",
    },
  },
  {
    name: "Use and Administration of Epinephrine Auto-Injectors",
    tag: onlineCourseTag,
    price: "$35.00",
    url: "/use-and-administration-of-epinephrine-auto-injectors",
    image: {
      src: "/images/epi.webp",
      alt: "Use and Administration of Epinephrine Auto-Injectors",
    },
  },
  {
    name: "CPR / First Aid",
    tag: onlineCourseTag,
    price: "$34.99",
    url: "/cpr-first-aid",
    image: { src: "/images/cpr.avif", alt: "CPR and First Aid" },
  },
];

const FIRST_GRID_LIMIT = 6;

const firstCourseGrid = certificationCourses.slice(0, FIRST_GRID_LIMIT);
const secondCourseGrid = certificationCourses.slice(FIRST_GRID_LIMIT);

export const courseGallerySections = [
  {
    type: "component" as const,
    component: "Header 60" as const,
    props: {
      headingPrefix: "Explore our state certified",
      heading: "Courses",
      description:
        "Advance your career with trusted, NREMT-accepted EMT and Paramedic training taught by experienced instructors with real-world emergency care experience.",
      image: {
        src: "/images/courses-header.avif",
        alt: "Certification courses at Midwest Emergency Academy",
      },
      overlayNav: true,
    },
  },
  {
    type: "component" as const,
    component: "Product 1" as const,
    props: {
      layout: "class-grid",
      products: firstCourseGrid,
    },
  },
  {
    type: "component" as const,
    component: "Testimonial 1" as const,
    props: {
      tagline: "Trusted by Industry Professionals",
      quote:
        "The process was seamless and streamlined and allowed my team members work at their own pace throughout the course.",
      name: "John Smith",
      position: "Fire Chief, KCFD",
      companyName: "",
      showLogo: false,
      showAvatar: false,
    },
  },
  {
    type: "component" as const,
    component: "Product 1" as const,
    props: {
      layout: "class-grid",
      products: secondCourseGrid,
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
      questions: courseGalleryFaqQuestions,
    },
  },
];
