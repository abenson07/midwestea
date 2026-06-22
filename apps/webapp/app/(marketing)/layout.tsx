import { Footer } from "@/components/marketing/footer";
import { MarketingScrollInit } from "@/components/marketing/marketing-scroll-init";
import { Navigation } from "@/components/marketing/navigation";
import { dmSans, ppNeueCorp } from "@/lib/marketing/fonts";
import { getBannerEnrollmentItems } from "@/lib/marketing/banner-enrollment";
import "./marketing.css";

const scrollRestorationScript = `(function(){try{history.scrollRestoration="manual";window.scrollTo(0,0);}catch(e){}})();`;

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bannerItems = await getBannerEnrollmentItems();

  return (
    <div className={`${dmSans.variable} ${ppNeueCorp.variable} bg-background font-body text-text antialiased`}>
      <script dangerouslySetInnerHTML={{ __html: scrollRestorationScript }} />
      <MarketingScrollInit />
      <Navigation bannerItems={bannerItems} />
      {children}
      <Footer />
    </div>
  );
}
