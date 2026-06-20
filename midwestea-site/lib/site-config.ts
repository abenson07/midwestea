import type { ComponentKey } from "@/lib/component-registry";
import { activeShooterTrainingSections } from "@/lib/pages/active-shooter-training-content";
import { advancedCardiovascularLifeSupportSections } from "@/lib/pages/advanced-cardiovascular-life-support-content";
import { basicLifeSupportSections } from "@/lib/pages/basic-life-support-content";
import { bloodbornePathogensSections } from "@/lib/pages/bloodborne-pathogens-content";
import { childAndBabysittingSafetySections } from "@/lib/pages/child-and-babysitting-safety-content";
import { cprFirstAidSections } from "@/lib/pages/cpr-first-aid-content";
import { emergencyMedicalResponderSections } from "@/lib/pages/emergency-medical-responder-content";
import { emergencyUseOfMedicalOxygenSections } from "@/lib/pages/emergency-use-of-medical-oxygen-content";
import { useAndAdministrationOfEpinephrineAutoInjectorsSections } from "@/lib/pages/use-and-administration-of-epinephrine-auto-injectors-content";
import { courseGallerySections } from "@/lib/pages/course-gallery-content";
import { courseTemplateSections } from "@/lib/pages/course-template-content";
import { pediatricAdvancedLifeSupportSections } from "@/lib/pages/pediatric-advanced-life-support-content";
import { pediatricFirstAidCprAedSections } from "@/lib/pages/pediatric-first-aid-cpr-aed-content";
import { purchaseConfirmationAvertSections } from "@/lib/pages/purchase-confirmation-avert-content";
import { purchaseConfirmationCpSections } from "@/lib/pages/purchase-confirmation-cp-content";
import { purchaseConfirmationEpinephrineSections } from "@/lib/pages/purchase-confirmation-epinephrine-content";
import { purchaseConfirmationOxygenSections } from "@/lib/pages/purchase-confirmation-oxygen-content";
import { advancedTacticalCasualtyCareSections } from "@/lib/pages/advanced-tactical-casualty-care-content";
import { communityParamedicSections } from "@/lib/pages/community-paramedic-content";
import { criticalCareTransportSections } from "@/lib/pages/critical-care-transport-content";
import { paramedicSections } from "@/lib/pages/paramedic-content";
import { emergencyMedicalTechnicianSections } from "@/lib/pages/emergency-medical-technician-content";
import { indexSections } from "@/lib/pages/index-content";
import { contactSections } from "@/lib/pages/contact-content";
import { faqSections } from "@/lib/pages/faq-content";
import { policiesListSections } from "@/lib/pages/policies-list-content";
import { privacyPolicySections } from "@/lib/pages/privacy-policy-content";
import { termsOfServiceSections } from "@/lib/pages/terms-of-service-content";
import { howItWorksCouressSections } from "@/lib/pages/how-it-works-couress-content";
import { howItWorksProgramsSections } from "@/lib/pages/how-it-works-programs-content";
import { aboutSections } from "@/lib/pages/about-content";
import { programsSections } from "@/lib/pages/programs-content";

export type CustomSection = {
  type: "custom";
  label: string;
  props?: Record<string, unknown>;
};

export type ComponentSection = {
  type: "component";
  component: ComponentKey;
  props?: Record<string, unknown>;
};

export type PageSection = CustomSection | ComponentSection;

export type PageConfig = {
  title: string;
  route: string;
  sections: PageSection[];
};

export const pages: PageConfig[] = [
  {
    title: "Midwest Emergency Academy – Trusted EMS Training in the Kansas City Area",
    route: "/",
    sections: indexSections,
  },
  {
    title: "Emergency Medical Technician",
    route: "/emergency-medical-technician",
    sections: emergencyMedicalTechnicianSections,
  },
  {
    title: "Course Template",
    route: "/course-template",
    sections: courseTemplateSections,
  },
  {
    title: "Certification Courses",
    route: "/courses",
    sections: courseGallerySections,
  },
  {
    title: "Program Gallery",
    route: "/program-gallery",
    sections: [
      { type: "custom", label: "Hero" },
      { type: "custom", label: "Class Scroll" },
    ],
  },
  {
    title: "EMS Programs - EMR, EMT, Paramedic & Advanced Training | MidwestEA",
    route: "/programs",
    sections: programsSections,
  },
  {
    title: "Contact",
    route: "/contact",
    sections: contactSections,
  },
  {
    title: "FAQ",
    route: "/faq",
    sections: faqSections,
  },
  {
    title: "Order Confirmation",
    route: "/order-confirmation",
    sections: [{ type: "custom", label: "Confirmation" }],
  },
  {
    title: "AVERT",
    route: "/purchase-confirmation/avert",
    sections: purchaseConfirmationAvertSections,
  },
  {
    title: "CP",
    route: "/purchase-confirmation/cp",
    sections: purchaseConfirmationCpSections,
  },
  {
    title: "Oxygen",
    route: "/purchase-confirmation/oxygen",
    sections: purchaseConfirmationOxygenSections,
  },
  {
    title: "Epinephrine",
    route: "/purchase-confirmation/epinephrine",
    sections: purchaseConfirmationEpinephrineSections,
  },
  {
    title: "About Midwest Emergency Academy",
    route: "/about",
    sections: aboutSections,
  },
  {
    title: "Terms of Service",
    route: "/terms-of-service",
    sections: termsOfServiceSections,
  },
  {
    title: "Privacy Policy",
    route: "/privacy-policy",
    sections: privacyPolicySections,
  },
  {
    title: "Basic Life Support",
    route: "/basic-life-support",
    sections: basicLifeSupportSections,
  },
  {
    title: "Advanced Cardiovascular Life Support",
    route: "/advanced-cardiovascular-life-support",
    sections: advancedCardiovascularLifeSupportSections,
  },
  {
    title: "Active Violence Emergency Response Training",
    route: "/active-shooter-training",
    sections: activeShooterTrainingSections,
  },
  {
    title: "Pediatric CPR & First Aid",
    route: "/pediatric-first-aid-cpr-aed",
    sections: pediatricFirstAidCprAedSections,
  },
  {
    title: "Pediatric Advanced Life Support",
    route: "/pediatric-advanced-life-support",
    sections: pediatricAdvancedLifeSupportSections,
  },
  {
    title: "Child and Babysitting Safety",
    route: "/child-and-babysitting-safety",
    sections: childAndBabysittingSafetySections,
  },
  {
    title: "CPR & First Aid",
    route: "/cpr-first-aid",
    sections: cprFirstAidSections,
  },
  {
    title: "Bloodborne Pathogens",
    route: "/bloodborne-pathogens",
    sections: bloodbornePathogensSections,
  },
  {
    title: "Emergency Use of Medical Oxygen",
    route: "/emergency-use-of-medical-oxygen",
    sections: emergencyUseOfMedicalOxygenSections,
  },
  {
    title: "Emergency Medical Responder",
    route: "/emergency-medical-responder",
    sections: emergencyMedicalResponderSections,
  },
  {
    title: "Use and Administration of Epinephrine Auto-Injectors",
    route: "/use-and-administration-of-epinephrine-auto-injectors",
    sections: useAndAdministrationOfEpinephrineAutoInjectorsSections,
  },
  {
    title: "Policy",
    route: "/policies",
    sections: policiesListSections,
  },
  {
    title: "Paramedic",
    route: "/paramedic",
    sections: paramedicSections,
  },
  {
    title: "Critical Care Transport",
    route: "/critical-care-transport",
    sections: criticalCareTransportSections,
  },
  {
    title: "Advanced Tactical Casualty Care",
    route: "/advanced-tactical-casualty-care",
    sections: advancedTacticalCasualtyCareSections,
  },
  {
    title: "Community Paramedic",
    route: "/community-paramedic",
    sections: communityParamedicSections,
  },
  {
    title: "Courses How it Works",
    route: "/how-it-works/couress",
    sections: howItWorksCouressSections,
  },
  {
    title: "Programs How it Works",
    route: "/how-it-works/programs",
    sections: howItWorksProgramsSections,
  },
];

export function getPageByRoute(route: string): PageConfig | undefined {
  return pages.find((page) => page.route === route);
}
