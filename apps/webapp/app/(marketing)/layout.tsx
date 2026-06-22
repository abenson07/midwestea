import { Footer } from "@/components/marketing/footer";
import { Navigation } from "@/components/marketing/navigation";
import { dmSans, ppNeueCorp } from "@/lib/marketing/fonts";
import { getBannerEnrollmentItems } from "@/lib/marketing/banner-enrollment";
import "./marketing.css";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bannerItems = await getBannerEnrollmentItems();

  return (
    <div className={`${dmSans.variable} ${ppNeueCorp.variable} bg-background font-body text-text antialiased`}>
      <Navigation bannerItems={bannerItems} />
      {children}
      <Footer />
    </div>
  );
}
