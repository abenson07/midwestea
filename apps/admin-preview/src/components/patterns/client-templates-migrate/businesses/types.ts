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

export type SponsorshipLevel = "platinum" | "gold" | "silver" | "bronze";

export type SponsorRow = {
  id: string;
  businessName: string;
  sponsorshipLevel: SponsorshipLevel;
  amount: number;
  lastSponsoredYear: number;
  sponsorSince: string;
};
