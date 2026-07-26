import { Header108 } from "./components/header-108";
import { Header108B } from "./components/header-108-b";
import { Header108C } from "./components/header-108-c";
import { Layout1 } from "./components/layout-1";
import { Layout1B } from "./components/layout-1-b";
import { Layout48 } from "./components/layout-48";
import { Layout241 } from "./components/layout-241";
import { Comparison6 } from "./components/comparison-6";
import { Content12 } from "./components/content-12";
import { Testimonial19 } from "./components/testimonial-19";
import { Cta25 } from "./components/cta-25";
import { Faq6 } from "@/components/marketing/faq-6";
import type { CareerChangerAdultLearnerContent } from "./content";

export function CareerChangerAdultLearnerTemplate({
  content,
}: {
  content: CareerChangerAdultLearnerContent;
}) {
  return (
    <main>
      <Header108 {...content.header108A} />
      <Header108B {...content.header108B} />
      <Layout1 {...content.layout1A} />
      <Layout48 {...content.layout48} />
      <Layout241 {...content.layout241} />
      <Layout1B {...content.layout1B} />
      <Comparison6 {...content.comparison6} />
      <Content12 metatags={content.content12.metatags}>
        {content.content12.body}
      </Content12>
      <Testimonial19 {...content.testimonial19} />
      <Cta25 {...content.cta25} />
      <Faq6 {...content.faqBanner} />
      <Header108C {...content.header108C} />
    </main>
  );
}
