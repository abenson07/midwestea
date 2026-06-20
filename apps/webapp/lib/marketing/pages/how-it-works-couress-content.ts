import type { PageSection } from "@/lib/marketing/site-config";

export const howItWorksCouressSections: PageSection[] = [
  {
    type: "component",
    component: "Layout 493",
    props: {
      tagline: "Getting certified has never been easier",
      heading: "Get started today",
      description: "Getting your certification has never been easier.",
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
          image: { src: "/images/firefigther-prep.png", alt: "Get certified" },
        },
      ],
    },
  },
];
