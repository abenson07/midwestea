import { CustomPlaceholder } from "@/components/custom-placeholder";
import { EnrollmentBar, type EnrollmentBarProps } from "@/components/enrollment-bar";
import { enrollmentBarDefaults } from "@/lib/enrollment-bar-defaults";
import { getCourseEnrollmentBarProps } from "@/lib/course-enrollment-bar";
import {
  ProgramHero,
  ProgramHeroDefaults,
  type ProgramHeroProps,
} from "@/components/program-hero";
import { componentRegistry } from "@/lib/component-registry";
import {
  customComponentRegistry,
  isCustomComponentKey,
} from "@/lib/custom-component-registry";
import type { PageConfig, PageSection } from "@/lib/site-config";

type PageRendererProps = {
  page: PageConfig;
};

function hasOverlayNavHero(page: PageConfig): boolean {
  const first = page.sections[0];
  if (first?.type !== "component") return false;

  if (first.component === "Product Header 6") {
    return first.props?.overlayNav === true;
  }

  if (first.component === "Header 60") {
    return first.props?.overlayNav !== false;
  }

  return false;
}

function hasProgramHero(page: PageConfig): boolean {
  const first = page.sections[0];
  return first?.type === "custom" && first.label === "Hero";
}

function hasHomeHero(page: PageConfig): boolean {
  const first = page.sections[0];
  return first?.type === "custom" && first.label === "HomeHero";
}

function isEnrollmentBarSection(section: PageSection): boolean {
  return section.type === "custom" && section.label === "Enrollment Bar";
}

function isHeroSection(section: PageSection): boolean {
  return section.type === "custom" && section.label === "Hero";
}

export function PageRenderer({ page }: PageRendererProps) {
  const overlayNavHero = hasOverlayNavHero(page);
  const programHero = hasProgramHero(page);
  const homeHero = hasHomeHero(page);
  const enrollmentSection = page.sections.find(isEnrollmentBarSection);
  const courseEnrollmentBar = getCourseEnrollmentBarProps(page.route, page.sections);
  const enrollmentProps = enrollmentSection
    ? ({
        ...enrollmentBarDefaults,
        ...(enrollmentSection.type === "custom" ? enrollmentSection.props : {}),
      } as EnrollmentBarProps)
    : courseEnrollmentBar;
  const showEnrollmentBar = Boolean(enrollmentProps);
  const sections = page.sections.filter(
    (section) => !isEnrollmentBarSection(section),
  );

  const mainClassName = (() => {
    if (overlayNavHero || programHero || homeHero) {
      return showEnrollmentBar ? "pb-28" : undefined;
    }
    return showEnrollmentBar
      ? "pb-28 pt-[var(--mea-nav-height)]"
      : "pt-[var(--mea-nav-height)]";
  })();

  return (
    <div className="relative">
      <main className={mainClassName}>
        {sections.map((section, index) => {
          if (section.type === "custom") {
            if (isHeroSection(section)) {
              const heroProps = {
                ...ProgramHeroDefaults,
                ...section.props,
              } as ProgramHeroProps;

              return <ProgramHero key={`hero-${index}`} {...heroProps} />;
            }

            if (isCustomComponentKey(section.label)) {
              const CustomComponent = customComponentRegistry[section.label];
              return (
                <CustomComponent
                  key={`${section.label}-${index}`}
                  {...(section.props ?? {})}
                />
              );
            }

            return (
              <CustomPlaceholder
                key={`${section.label}-${index}`}
                label={section.label}
                height="80vh"
              />
            );
          }

          const Component = componentRegistry[section.component];
          return (
            <Component
              key={`${section.component}-${index}`}
              {...(section.props ?? {})}
            />
          );
        })}
      </main>

      {showEnrollmentBar && enrollmentProps ? (
        <EnrollmentBar
          {...enrollmentProps}
          className="fixed bottom-0 left-0 z-50 w-full"
        />
      ) : null}
    </div>
  );
}
