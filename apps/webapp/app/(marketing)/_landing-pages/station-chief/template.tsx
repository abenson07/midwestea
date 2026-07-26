import { Header82 } from "./components/header-82";
import { Layout1 } from "./components/layout-1";
import { Layout141 } from "./components/layout-141";
import { Layout241 } from "./components/layout-241";
import { Content12 } from "./components/content-12";
import { Testimonial19 } from "./components/testimonial-19";
import { Cta25 } from "./components/cta-25";
import { Header108 } from "./components/header-108";
import { Faq6 } from "@/components/marketing/faq-6";
import type { StationChiefContent } from "./content";

export function StationChiefTemplate({
  content,
}: {
  content: StationChiefContent;
}) {
  return (
    <main>
      <Header82 {...content.header82} />
      <Layout1 {...content.layout1A} />
      <Layout1 {...content.layout1B} />
      <Layout1 {...content.layout1C} />
      <Layout141 {...content.layout141} />
      <Layout241 {...content.layout241} />
      <Content12 metatags={content.content12.metatags}>
        {content.content12.body}
      </Content12>
      <Testimonial19 {...content.testimonial19} />
      <Cta25 {...content.cta25} />
      <Faq6 {...content.faqBanner} />
      <Header108 {...content.header108} />
    </main>
  );
}
