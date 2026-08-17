export type BusinessMembershipStatus = "active" | "past_due" | "pending" | "lapsed";

export type BusinessMemberRow = {
  id: string;
  businessName: string;
  tier: string;
  renewalDate: string;
  status: BusinessMembershipStatus;
  memberSince: string;
  annualDues: number;
};

export type BusinessRow = {
  id: string;
  businessName: string;
  category: string;
  contactName: string;
  phone: string;
};

export type SponsorshipLevel = "platinum" | "gold" | "silver";

export type SponsorRow = {
  id: string;
  businessName: string;
  sponsorshipLevel: SponsorshipLevel;
  amount: number;
  lastSponsoredYear: number;
  sponsorSince: string;
};

export const sampleBusinessMembers: BusinessMemberRow[] = [
  { id: "bmem-1", businessName: "Riverbend Hardware", tier: "Gold", renewalDate: "Aug 1, 2026", status: "past_due", memberSince: "Mar 3, 2021", annualDues: 750 },
  { id: "bmem-2", businessName: "Maple Leaf Dental", tier: "Silver", renewalDate: "Sep 12, 2026", status: "pending", memberSince: "Feb 14, 2026", annualDues: 400 },
  { id: "bmem-3", businessName: "Cedar Street Bakery", tier: "Bronze", renewalDate: "Oct 3, 2026", status: "active", memberSince: "Jun 20, 2024", annualDues: 200 },
  { id: "bmem-4", businessName: "Dubuque Auto Repair", tier: "Gold", renewalDate: "Nov 20, 2026", status: "active", memberSince: "Jan 9, 2020", annualDues: 750 },
  { id: "bmem-5", businessName: "Willow Creek Veterinary", tier: "Silver", renewalDate: "Jun 15, 2026", status: "lapsed", memberSince: "Aug 11, 2022", annualDues: 400 },
  { id: "bmem-6", businessName: "Birchwood Coffee Co.", tier: "Bronze", renewalDate: "Jul 22, 2026", status: "active", memberSince: "Apr 2, 2026", annualDues: 200 },
];

export const sampleSponsors: SponsorRow[] = [
  { id: "spo-1", businessName: "Riverbend Hardware", sponsorshipLevel: "platinum", amount: 2500, lastSponsoredYear: 2026, sponsorSince: "Mar 3, 2021" },
  { id: "spo-2", businessName: "Dubuque Auto Repair", sponsorshipLevel: "gold", amount: 1200, lastSponsoredYear: 2025, sponsorSince: "Jan 9, 2020" },
  { id: "spo-3", businessName: "Maple Leaf Dental", sponsorshipLevel: "gold", amount: 1000, lastSponsoredYear: 2026, sponsorSince: "Feb 14, 2026" },
  { id: "spo-4", businessName: "Cedar Street Bakery", sponsorshipLevel: "silver", amount: 500, lastSponsoredYear: 2024, sponsorSince: "Jun 20, 2024" },
  { id: "spo-5", businessName: "Riverside Realty Group", sponsorshipLevel: "silver", amount: 500, lastSponsoredYear: 2026, sponsorSince: "May 5, 2026" },
];

export const sampleAllBusinesses: BusinessRow[] = [
  { id: "biz-1", businessName: "Riverbend Hardware", category: "Retail", contactName: "Garrett Bull", phone: "(563) 555-0148" },
  { id: "biz-2", businessName: "Maple Leaf Dental", category: "Healthcare", contactName: "Max Pekay", phone: "(563) 555-0172" },
  { id: "biz-3", businessName: "Cedar Street Bakery", category: "Food & Beverage", contactName: "Delia Marsh", phone: "(563) 555-0193" },
  { id: "biz-4", businessName: "Dubuque Auto Repair", category: "Automotive", contactName: "Theo Bramwell", phone: "(563) 555-0114" },
  { id: "biz-5", businessName: "Willow Creek Veterinary", category: "Healthcare", contactName: "Ines Okafor", phone: "(563) 555-0129" },
  { id: "biz-6", businessName: "Birchwood Coffee Co.", category: "Food & Beverage", contactName: "Ruth Calloway", phone: "(563) 555-0165" },
  { id: "biz-7", businessName: "Riverside Realty Group", category: "Real Estate", contactName: "Owen Fitzgerald", phone: "(563) 555-0187" },
];
