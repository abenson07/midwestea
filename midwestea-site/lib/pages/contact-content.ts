import type { PageSection } from "@/lib/site-config";

export const contactSections: PageSection[] = [
  {
    type: "component",
    component: "FAQ 6",
    props: {
      heading: "Contact us",
      questionsHeading: "Most common questions",
      contactItems: [
        {
          label: "Got a specific question?",
          linkText: "Sbrooks@midwestea.com",
          href: "mailto:Sbrooks@midwestea.com",
        },
        {
          label: "Step up and train",
          body:
            "Become a certified trainer and teach the next generation of first responders. Email us at",
          linkText: "Sbrooks@midwestea.com",
          href: "mailto:Sbrooks@midwestea.com",
        },
      ],
      button: { title: "" },
      questions: [
        {
          title: "Do I need any experience before taking a course?",
          answer:
            "While most courses do not require previous medical experience, some advanced programs do have prerequisites such as age requirements, BLS certification, or active EMS credentials.",
        },
        {
          title: "Are your certifications accepted in Missouri, Kansas, and nationally?",
          answer:
            "Yes. MidwestEA provides state-approved training aligned with NREMT, AHA, and national EMS standards. Our courses are built for students in the Kansas City metro and the wider regional area we serve. Certification validity depends on the course (most are 2 years), and advanced programs list state-specific and national acceptance clearly.",
        },
        {
          title: "How long does it take to complete a course?",
          answer:
            "Course length varies by program. Short courses may take a few hours, while larger programs like EMT or Paramedic span weeks. Each course and program page includes a clear breakdown of total hours and delivery format.",
        },
        {
          title: "Are courses and programs offered online, in person, or hybrid?",
          answer:
            "We offer a variety of training formats to fit your needs. While our certification courses are delivered online for convenience, our EMR and EMS training programs include required hands-on components to ensure you build real, job-ready skills. Our team can accommodate special in-person requests when possible.",
        },
        {
          title: "What happens after I complete the course?",
          answer:
            "Upon successful completion, you'll receive a certification or completion record that meets state and national requirements for that course. For EMS programs (EMT, Paramedic, CCP), you'll also receive instructions on next steps such as testing, licensure, or continuing education.",
        },
      ],
    },
  },
];
