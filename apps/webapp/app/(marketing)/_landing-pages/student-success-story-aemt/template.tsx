import { Header137 } from "./components/header-137";
import { Layout1 } from "./components/layout-1";
import { Comparison6 } from "./components/comparison-6";
import { Layout241 } from "./components/layout-241";
import { Content2 } from "./components/content-2";
import { Testimonial19 } from "./components/testimonial-19";
import { Header108 } from "./components/header-108";
import { Faq6 } from "@/components/marketing/faq-6";
import { EnrollmentBar } from "@/components/marketing/enrollment-bar";
import type { StudentSuccessStoryContent } from "./content";

export function StudentSuccessStoryTemplate({
  content,
}: {
  content: StudentSuccessStoryContent;
}) {
  return (
    <div className="relative">
      <main className="pb-28">
        <Header137 {...content.header137} />
        <Layout1 {...content.layout1A} />
        <Comparison6 {...content.comparison6} />
        <Layout1 {...content.layout1B} />
        <Layout1 {...content.layout1C} />
        <Layout241 {...content.layout241} />
        <Content2 heading={content.content2.heading} image={content.content2.image}>
          {content.content2.body}
        </Content2>
        <Testimonial19 {...content.testimonial19} />
        <Faq6 {...content.faqBanner} />
        <Header108 {...content.header108} />
      </main>
      <EnrollmentBar
        titleLines={["AEMT", "Program"]}
        variant="waitlist"
        priceNote="Get certified today for just"
        waitlistLabel="Join waitlist"
        waitlistHref="#"
        className="fixed bottom-0 left-0 z-50 w-full"
      />
    </div>
  );
}
