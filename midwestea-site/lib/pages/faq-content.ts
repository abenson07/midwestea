import type { PageSection } from "@/lib/site-config";

export const faqSections: PageSection[] = [
  {
    type: "component",
    component: "FaqHero",
    props: {
      heading: "Questions?",
      description: "Looking for something specific?",
      navLinks: [
        { label: "Enrollment & payment", href: "#Enrollment-Payment" },
        { label: "Course & program details", href: "#Course-Program-Details" },
        {
          label: "Certifications & continuing education",
          href: "#Certifications-Continuing-Education",
        },
        { label: "Policies & support", href: "#Policies-Support" },
        { label: "Careers & outcomes", href: "#Careers-Outcomes" },
      ],
      button: {
        title: "Still need help?",
        url: "/contact",
      },
      categories: [
        {
          id: "Enrollment-Payment",
          title: "Enrollment & Payment",
          questions: [
            {
              title: "What do I need before enrolling?",
              answer:
                "Most courses do not require prior medical experience. Some programs—like EMT or Paramedic—have specific prerequisites such as age requirements, BLS certification, or active EMS credentials. Each course lists what you need before signing up.",
            },
            {
              title: "How do I reserve my seat in a course or program?",
              answer:
                "You can register directly through our website. Some programs require an application or additional documents before acceptance. Your confirmation email includes next steps and any material you'll need.",
            },
            {
              title: "Do you offer payment plans?",
              answer:
                "Yes. Many programs offer flexible payment options to make training more accessible. Options vary by course and will be shown during checkout or explained during the program application process.",
            },
            {
              title: "Do I need to live in the Kansas City area to participate?",
              answer:
                "MidwestEA serves the Kansas City metro and surrounding region. While courses are delivered online, our programs and any in-person training designed specifically for students within this service area.",
            },
          ],
        },
        {
          id: "Course-Program-Details",
          title: "Course & Program Details",
          questions: [
            {
              title: "Are your courses online or in person?",
              answer:
                "All courses are currently online only. If your group or organization needs in-person instruction, we can accommodate that by request. EMS programs may include blended components with required hands-on skills labs.",
            },
            {
              title: "How long does each course or program take?",
              answer:
                "Length varies—short certifications take a few hours, while EMS programs may span weeks or months. Each course page lists the estimated time commitment and structure.",
            },
            {
              title: "Do I need to buy any equipment or materials?",
              answer:
                "Most online courses include everything you need inside the platform. Programs that require skills sessions or clinical components provide a list of required materials or uniforms during enrollment.",
            },
            {
              title: "How many students are in each class?",
              answer:
                "Class size varies by course. Online courses allow self-paced learning, while programs with hands-on skills sessions use small instructor-to-student ratios to maintain quality.",
            },
            {
              title: "Can I switch course dates after enrolling?",
              answer:
                "In many cases, yes—depending on availability and program policies. Contact student support as early as possible to make changes.",
            },
          ],
        },
        {
          id: "Certifications-Continuing-Education",
          title: "Certifications & Continuing Education",
          questions: [
            {
              title:
                "Are your certifications recognized in Missouri, Kansas, and nationally?",
              answer:
                "Yes. MidwestEA provides state-approved training aligned with AHA, NREMT, and national EMS standards. Certifications are designed for students in the Kansas City region, and most are recognized nationally when applicable.",
            },
            {
              title: "How long is my certification valid?",
              answer:
                "Most certifications are valid for two years, though EMS licensure timelines vary by state. Program pages include exact renewal periods.",
            },
            {
              title: "Do you offer renewal or refresher courses?",
              answer:
                "Yes. Many of our courses include renewal options to help you stay current. Renewal requirements and scheduling are listed on each course page.",
            },
            {
              title: "Will I receive a certification card or digital certificate?",
              answer:
                "Yes. After successful completion, you'll receive a digital certificate accepted by employers and state agencies. Some programs also provide instructions for state or NREMT testing.",
            },
            {
              title: "Can I use these courses for continuing education credits?",
              answer:
                "Many courses offer CE hours through nationally recognized bodies such as CAPCE. CE availability is listed on each course page.",
            },
          ],
        },
        {
          id: "Policies-Support",
          title: "Policies & Support",
          questions: [
            {
              title: "What if I need help during my course?",
              answer:
                "Our support team is available to assist with technical issues, course access, and general questions. You can reach us by email or through the help portal.",
            },
            {
              title: "Can I pause or extend my course access?",
              answer:
                "For many online courses, extensions are available based on individual circumstances. Programs with fixed schedules have defined timelines that cannot be extended without approval.",
            },
            {
              title:
                "What happens if I miss a skills session or scheduled requirement?",
              answer:
                "Programs that include hands-on components require attendance, but makeup sessions may be available depending on instructor schedules.",
            },
            {
              title: "Do you accommodate accessibility needs?",
              answer:
                "Yes. We work with students to provide reasonable accommodations for learning differences, mobility limitations, or other needs. Contact us before your course begins.",
            },
            {
              title: "How do I request an in-person session for my organization?",
              answer:
                "Groups can request on-site instruction or skills training. Contact us with your preferred date, location, and group size, and we'll coordinate availability.",
            },
          ],
        },
        {
          id: "Careers-Outcomes",
          title: "Careers & Outcomes",
          questions: [
            {
              title: "Will this certification help me get a job?",
              answer:
                "Our training prepares you with the skills employers expect, but we do not guarantee placement. Many students use their certifications to advance in their current roles or enter EMS pathways.",
            },
            {
              title: "What careers can I pursue after completing a program?",
              answer:
                "Depending on the program, students may qualify for roles such as EMT, Paramedic, Critical Care Transport provider, community paramedic, or workplace emergency responder.",
            },
            {
              title: "Do you provide guidance on next steps after training?",
              answer:
                "Yes. For EMS programs, we provide instructions for licensure, NREMT testing, and continuing education. Our instructors are available to discuss career pathways within the Kansas City region.",
            },
            {
              title: "Can I continue to advanced training after completing a course?",
              answer:
                "Absolutely. Many students progress from EMR → EMT → Paramedic → Critical Care or community paramedicine. Each path builds on the last.",
            },
            {
              title:
                "Do employers in the Kansas City area recognize MidwestEA training?",
              answer:
                "Yes. MidwestEA is trusted across the Kansas City metro and surrounding region, and our certifications align with state and national standards used by local EMS agencies, hospitals, and public safety organizations.",
            },
          ],
        },
      ],
    },
  },
];
