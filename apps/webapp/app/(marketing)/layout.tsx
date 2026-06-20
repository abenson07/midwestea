import { Footer } from "@/components/marketing/footer";
import { Navigation } from "@/components/marketing/navigation";
import { dmSans, ppNeueCorp } from "@/lib/marketing/fonts";
import "./marketing.css";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${dmSans.variable} ${ppNeueCorp.variable} bg-background font-body text-text antialiased`}>
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}
