import Image from "next/image";
import Link from "next/link";

const aboutLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const courseLinksCol1 = [
  { label: "Basic Life Support", href: "/basic-life-support" },
  { label: "Advanced Cardiovascular Life Support", href: "/advanced-cardiovascular-life-support" },
  { label: "Active Violence Emergency Response Training", href: "/active-shooter-training" },
  { label: "Pediatric Advanced Life Support", href: "/pediatric-advanced-life-support" },
  { label: "CPR/First Aid", href: "/cpr-first-aid" },
];

const courseLinksCol2 = [
  { label: "Pediatric CPR", href: "/pediatric-first-aid-cpr-aed" },
  { label: "Child and Babysitting Safety", href: "/child-and-babysitting-safety" },
  { label: "Use and Administration of Epinephrine", href: "/use-and-administration-of-epinephrine-auto-injectors" },
  { label: "Bloodborne Pathogens", href: "/bloodborne-pathogens" },
  { label: "Emergency Use of Medical Oxygen", href: "/emergency-use-of-medical-oxygen" },
];

const programLinks = [
  { label: "Paramedic", href: "/paramedic" },
  { label: "Emergency Medical Technician", href: "/emergency-medical-technician" },
  { label: "Advanced Emergency Medical Technician", href: "/advanced-emergency-medical-technician" },
  { label: "Emergency Medical Response", href: "/emergency-medical-responder" },
  { label: "Advanced Tactical Casualty Care", href: "/advanced-tactical-casualty-care" },
  { label: "Community Paramedic", href: "/community-paramedic" },
  { label: "Critical Care Paramedic", href: "/critical-care-transport" },
];

function FooterLinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-sm text-text-alternative hover:underline">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer data-scroll="footer" className="bg-neutral-darkest text-text-alternative">
      <div className="px-[5%]">
        <div className="container">
          <div className="py-16 lg:py-20">
            <div className="mb-12 grid grid-cols-1 gap-8 border-b border-neutral-darker pb-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-3 text-sm font-semibold">About</p>
                <FooterLinkList links={aboutLinks} />
              </div>
              <div className="md:col-span-2">
                <p className="mb-3 text-sm font-semibold">Life Saving Courses</p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FooterLinkList links={courseLinksCol1} />
                  <FooterLinkList links={courseLinksCol2} />
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">Career Programs</p>
                <FooterLinkList links={programLinks} />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/" aria-label="Midwest EA home">
                  <Image
                    src="/images/MidwestEAlogo_MidwestEA_lockup_white.svg"
                    alt="Midwest EA"
                    width={160}
                    height={40}
                    className="h-auto w-40"
                  />
                </Link>
                <p className="text-sm text-neutral-light lg:col-span-2">
                  © 2025 MidwestEA. All rights reserved.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/policies" className="hover:underline">
                    Academic Policies
                  </Link>
                  <Link href="/terms-of-service" className="hover:underline">
                    Terms of Service
                  </Link>
                  <Link href="/privacy-policy" className="hover:underline">
                    Privacy policy
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href="https://www.facebook.com/p/Midwest-Emergency-Academy-61571290473533/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Midwest EA on Facebook"
                  className="text-text-alternative hover:opacity-80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M22.06 11.987C22.0597 10.0644 21.5085 8.18206 20.4717 6.56294C19.4348 4.94383 17.9558 3.6557 16.2096 2.85105C14.4635 2.04641 12.5233 1.75894 10.6188 2.02269C8.71437 2.28643 6.92535 3.09035 5.46358 4.33926C4.00181 5.58817 2.92849 7.22977 2.37071 9.06972C1.81292 10.9097 1.79401 12.8709 2.31623 14.7213C2.83845 16.5717 3.87992 18.2336 5.31735 19.5105C6.75478 20.7873 8.52797 21.6256 10.427 21.926V14.9H7.872V11.987H10.427V9.771C10.3721 9.25334 10.4318 8.72994 10.6017 8.23788C10.7716 7.74581 11.0476 7.29713 11.4101 6.92358C11.7727 6.55004 12.213 6.26079 12.6998 6.0763C13.1865 5.89181 13.7079 5.8166 14.227 5.856C14.9815 5.8675 15.7342 5.93435 16.479 6.056V8.529H15.211C14.9948 8.50024 14.7749 8.52047 14.5676 8.58821C14.3603 8.65594 14.1709 8.76945 14.0134 8.92031C13.8559 9.07118 13.7344 9.25555 13.6578 9.45975C13.5812 9.66396 13.5515 9.88278 13.571 10.1V11.987H16.362L15.915 14.9H13.571V21.93C15.9381 21.5549 18.0937 20.3474 19.6499 18.5247C21.2061 16.7019 22.0607 14.3837 22.06 11.987Z" />
                  </svg>
                </a>
                <a
                  href="https://www.midwesternoriginals.com/?utm_source=midwestea&utm_medium=footer_link&utm_campaign=brand_attribution"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  Designed and built by Midwestern Originals
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
